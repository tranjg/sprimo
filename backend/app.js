import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { Pool } from "pg";

const app = express();
const port = process.env.BACKEND_PORT || 3000;

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgStore = pgSession(session);

app.use(
  cors({
    origin: "http://localhost:5173", // TO-DO: change to env url
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgStore({
      pool: pgPool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.get("/api", (req, res) => {
  res.send("Sprimo Backend");
});

// ROUTES
import authRoutes from "./routes/auth.route.ts";
app.use("/api/auth", authRoutes);

import teamRoutes from "./routes/team.route.ts";
app.use("/api/team", teamRoutes);

import jiraRoutes from "./routes/jira.route.ts";
app.use("/api/jira", jiraRoutes);

import gitRoutes from "./routes/github.route.ts";
app.use("/api/github", gitRoutes);

app.listen(port, () => {
  console.log(`Sprimo Backend started on port ${port}`);
});
