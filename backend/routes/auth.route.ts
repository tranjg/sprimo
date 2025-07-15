import express from "express";
import { register, login, authorize, callback, getSessionInfo } from "../controllers/auth.controller.ts";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/authorize", authorize)

router.get("/callback", callback)

router.get("/session", getSessionInfo)

export default router