import express from "express";
import {
  authorize,
  callback,
  getProjects,
  getCompletionRate,
  getSprintsForBoard,
  getIssuesForSprint,
  getBoards,
  getJiraMetrics,
} from "../controllers/jira.controller.ts";

const router = express.Router();

router.get("/authorize", authorize);
router.get("/callback", callback);
router.get("/get-projects", getProjects);
router.get("/get-boards", getBoards);

router.get("/metrics", getJiraMetrics);

router.get("/get-sprints-for-board", getSprintsForBoard);
router.get("/get-issues-for-sprint", getIssuesForSprint);

// router.get("/get-issues-for-project", getIssuesForProject);
router.get("/get-completion-rate", getCompletionRate);

export default router;
