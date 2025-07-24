import express from "express";
import {
  authorize,
  callback,
  getProjects,
  getCompletionRate,
  getIssuesForProject,
} from "../controllers/jira.controller.ts";

const router = express.Router();

router.get("/authorize", authorize);
router.get("/callback", callback);
router.get("/get-projects", getProjects);


router.get("/get-issues-for-project", getIssuesForProject);
router.get("/get-completion-rate", getCompletionRate);

export default router;
