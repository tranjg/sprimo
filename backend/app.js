import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.BACKEND_PORT

app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.get('/api', (req, res) => {
  res.send('Sprimo Backend')
})
app.listen(port, () => {
  console.log(`Sprimo Backend started on port ${port}`)
})


// ROUTES
import authRoutes from './routes/auth.route.ts'
app.use("/api/auth", authRoutes)

import teamRoutes from './routes/team.route.ts'
app.use("/api/team", teamRoutes)