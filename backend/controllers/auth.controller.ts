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
      req.session.userId = user[0].id;

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

export const logout = async (req, res) => {
  const refreshToken = req.session.jira_refreshToken;

  if (refreshToken) {
    try {
      await axios.post(
        "https://auth.atlassian.com/oauth/token/revocation",
        {
          token: refreshToken,
          token_type_hint: "refresh_token",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Token revocation failed:", err.message);
    }
  }

  delete req.session.jira_accessToken;
  delete req.session.jira_refreshToken;
  delete req.session.github_accessToken;

  req.session.save(() => {
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  res.clearCookie("connect.sid", { path: "/" });

};

export const getSessionInfo = (req, res) => {
  res.json({
    jira_accessToken: req.session.jira_accessToken,
    jira_refreshToken: req.session.jira_refreshToken,
    github_accessToken: req.session.github_accessToken,
    userId: req.session.userId,
    username: req.session.username,
    expiresAt: req.session.tokenExpiresAt,
  });
};
