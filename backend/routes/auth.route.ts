import express from "express";
import { register, login, getSessionInfo } from "../controllers/auth.controller.ts";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/session", getSessionInfo)

export default router