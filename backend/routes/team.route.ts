import express from "express";
import { addTeam } from "../controllers/team.controller.ts";

const router = express.Router();

router.post("/add-team", addTeam);

export default router