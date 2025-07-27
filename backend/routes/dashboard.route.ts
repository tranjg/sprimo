import express from 'express'
import { getHomeDashboardMetrics } from '../controllers/dashboard.controller.ts'

const router = express.Router()

router.get("/home", getHomeDashboardMetrics)

export default router