import express from "express";
import { addProject, getProjects } from "../controllers/project.controller.ts";

const router = express.Router();

router.post("/add-project", addProject);

router.get("/get-project", getProjects)

export default router;