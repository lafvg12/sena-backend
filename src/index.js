import express from 'express'

const app = express()
app.use(express.json())


app.get('/', (req, res) => {
    res.json('Hello World')
})


app.listen(4000, () => {
    console.info('Server is running on port 4000')
})