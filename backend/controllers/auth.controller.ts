import { drizzle } from "drizzle-orm/node-postgres";
import { or, eq, and } from "drizzle-orm";
import { users } from "../drizzle/schema.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

const db = drizzle(process.env.DATABASE_URL as string);
const salt = await bcrypt.genSalt(10);

export const register = async (req, res) => {
  try {
    const values = req.body;

    const passwordHash = await bcrypt.hash(values.password, salt);

    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, values.email))
      .limit(1);

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, values.username))
      .limit(1);

    if (existingEmail.length > 0 && existingUsername.length > 0) {
      return res
        .status(409)
        .json({ message: "Email and username already exists." });
    } else if (existingEmail.length > 0) {
      return res.status(409).json({ message: "Email already exists." });
    } else if (existingUsername.length > 0) {
      return res.status(409).json({ message: "Username already exists." });
    } else {
      await db.insert(users).values({ ...values, password: passwordHash });
      return res.status(201).json({ message: "Successfully signed up" });
    }
  } catch (error) {
    console.error("Error during sign up:", error);

    return res
      .status(500)
      .json({ message: "There was an error signing up", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const values = req.body;
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, values.email));
    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    console.log(user[0]);
    const isPassword = await bcrypt.compare(values.password, user[0].password);
    if (isPassword) {
      const token = jwt.sign(
        { id: user[0].id, email: user[0].email, username: user[0].username },
        process.env.JWT_SECRET,
        {
          expiresIn: 300,
        }
      );
      req.session.userToken = token;
      return res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
          id: user[0].id,
          token: token,
          username: user[0].username,
          email: user[0].email,
          first_name: user[0].first_name,
          last_name: user[0].last_name,
        },
      });
    } else {
      return res
        .status(500)
        .json({ message: "Invalid login information", success: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "There was an error logging in." });
  }
};

const redirectUri = "http://localhost:3000/api/auth/callback"; // Must match Atlassian dev console
const clientId = process.env.ATLASSIAN_DEV_CLIENT_ID;
const clientSecret = process.env.ATLASSIAN_DEV_SECRET;

export const authorize = async (req, res) => {
  try {
    const scopes = ["read:jira-user", "read:jira-work", "offline_access"].join(
      " "
    );

    const stateData = {
      state: crypto.randomUUID(),
      returnTo: req.query.returnTo || "/dashboard",
    };
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString(
      "base64"
    );

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${encodedState}&response_type=code&prompt=consent`;

    res.redirect(authUrl);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "There was an error authorizing", success: false });
  }
};

export const callback = async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  try {
    const stateData = JSON.parse(Buffer.from(state, "base64").toString("utf8"));
    const returnTo = stateData.returnTo || "/";

    const tokenResponse = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("JIRA TOKEN RESPONSE: ", tokenResponse.data);
    console.log(returnTo);
    const { access_token, refresh_token } = tokenResponse.data;
    req.session.accessToken = access_token; // TO-DO: save to db
    req.session.refreshToken = refresh_token; // TO-DO: save to db
    // res.json({ access_token: access_token, refresh_token: refresh_token });
    res.redirect(returnTo);
  } catch (error) {
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }
    res.status(500).send("Error exchanging code for token");
  }
};

export const getSessionInfo = (req, res) => {
  res.json({
    accessToken: req.session.accessToken,
    refreshToken: req.session.refreshToken,
    userId: req.session.userId,
    username: req.session.username,
    expiresAt: req.session.tokenExpiresAt,
  });
};
