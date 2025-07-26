import express from "express";
import { authorize, callback, getCommitsForRepo, getIssuesForRepo, getPullRequestsForRepo, getRepos } from "../controllers/github.controller.ts";

const router = express.Router();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "tranjg";

router.get("/authorize", authorize);
router.get("/callback", callback);

router.get("/get-repos", getRepos);
router.get("/pull-requests", getPullRequestsForRepo);

router.get("/commits", getCommitsForRepo);

router.get("/issues", getIssuesForRepo);

export default router
