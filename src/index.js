const express = require('express')
const { Pool } = require('pg');
const app = express()
const cors = require('cors')
const session = require('express-session')

const port = process.env.PORT || 3000

app.use(express.json())

app.use(cors({
  origin: '*',
  credentials: true
}))

app.use(session({
  secret: '3caa8cac542d2f130481351d6cf702e937f961846b7bb581de851fefe2b88cfd'
}))

const pool = new Pool({
    host: 'localhost',
    user: 'root',
    database: 'login',
    password: 'example',
    port: 5434,
  });

app.post('/login', async (req, res) => { 
  const data = req.body;
    
  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM usuarios WHERE usuario = $1 AND clave = $2';
    const values = [data.usuario, data.clave];
    const results = await client.query(query, values);

    if (results.rows.length > 0) {
      req.session.usuario = data.usuario;
      res.status(200).send('Sign in successfull');
    } else {
      res.status(401).send('Data wrong');
    }
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server Error');
  }

})
app.get('/validate',async  (req, res) => {
    const data = req.session.usuario;
    console.log("🚀 ~ app.get ~ data:", data)
    const client = await pool.connect();
    const query = 'SELECT * FROM usuarios WHERE usuario = $1';
    const result = await client.query(query, [data])

  if (req.session.usuario) {
    res.status(200).send('Validated session');
  } else {
    res.status(401).send('not authorized');
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})