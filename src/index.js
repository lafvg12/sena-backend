import express from 'express'
const app = express()



app.use(express.json())
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' })
})


app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000')
})