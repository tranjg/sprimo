import express from "express";
import { addTeam } from "../controllers/team.controller";

const router = express.Router();

router.post("/add-team", addTeam);

export default router