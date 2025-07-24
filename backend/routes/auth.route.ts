import express from "express";
import { register, login, getSessionInfo, logout } from "../controllers/auth.controller.ts";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout)

router.get("/session", getSessionInfo)

export default router