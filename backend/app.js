import express from 'express'
const app = express()
const port = 3000

app.get('/api', (req, res) => {
  res.send('Sprimo Backend')
})
app.listen(port, () => {
  console.log(`Sprimo Backend started on port ${port}`)
})
