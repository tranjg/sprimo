import express from "express";
import { getInsightsByProject } from "../controllers/insights.controller.ts";

const router = express.Router();

router.get("/projects", getInsightsByProject

);

export default router;
