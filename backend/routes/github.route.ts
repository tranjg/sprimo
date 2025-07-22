import express from "express";
import { authorize, callback, getRepos } from "../controllers/github.controller.ts";

const router = express.Router();

router.get("/authorize", authorize);
router.get("/callback", callback);

router.get("/get-repos", getRepos);

export default router
