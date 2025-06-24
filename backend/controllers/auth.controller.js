import { drizzle } from "drizzle-orm/node-postgres";
import { or, eq, and } from "drizzle-orm";
import { users } from "../drizzle/schema.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = drizzle(process.env.DATABASE_URL);

export const register = async (req, res) => {
  try {
    const values = req.body;
    const salt = await bcrypt.genSalt(10);
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
    const values = req.body
    const user = await db
    .select()
    .from(users)
    .where(
        eq(users.email, values.email)
      )
    if (!user) {
      return res.status(409).json({message: "User not found"})
    }
    
    await bcrypt.compare(values.password, user.password, (data) => {
      if (data) {
        const token = jwt.sign({id: user[0].id,email: user[0].email, username: user[0].username}, process.env.JWT_SECRET, {
          expiresIn: 300,
        })
        return res
        .status(200)
        .json({
          message: "Login successful",
          token: token,
          user: {
            id: user[0].id,
            username: user[0].username,
            email: user[0].email
          }
        })
      }
    })
  } catch (error) {
    return res.status(500).json({ message: "There was an error logging in."})
  }
}