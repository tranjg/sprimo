import express from "express";
import { addProject } from "../controllers/project.controller.ts";

const router = express.Router();

router.post("/add-project", addProject);

export default router;