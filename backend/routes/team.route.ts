import express from "express";
import { addTeam, getTeams } from "../controllers/team.controller.ts";

const router = express.Router();

router.post("/add-team", addTeam);

router.get("/get-teams", getTeams)

export default router