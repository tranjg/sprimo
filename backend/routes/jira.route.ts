import express from "express"
import { authorize, callback, getBoards, getProjects } from "../controllers/jira.controller.ts"

const router = express.Router()

router.get("/authorize", authorize)
router.get("/callback", callback)
router.get("/get-projects", getProjects)
router.get("/get-boards", getBoards)

export default router