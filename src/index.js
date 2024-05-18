import express from 'express';
import cors from 'cors';
import  {clientDB}  from './utils/db.js';
import jwt from 'jsonwebtoken';

import 'dotenv/config'
;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));


app.post('/login', async (req, res) => { 
  const data = req.body;
  const client = await clientDB();
  
  try {
    const query = 'SELECT * FROM usuarios WHERE usuario = $1 AND clave = $2';
    const values = [data.usuario, data.clave];
    const results = await client.query(query, values);

    if (results.rows.length > 0) {
      const jwtToken = jwt.sign({ usuario: data.usuario,  exp: Math.floor(Date.now() / 1000) + (60 * 60), }, process.env.SECRET_KEY);
      
      res.status(200).json({ token: jwtToken });
    } else {
      res.status(401).send('Somethig went wrong, please try again');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

app.post('/validate', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Not authorized, no token provided');
  }
  
  try {
    const token = req.headers.authorization.split(' ')[1];
    const isValid = jwt.verify(token, process.env.SECRET_KEY);

    if (isValid) {
      res.status(200).send('Validated session');
    } else {
    }
  } catch (err) {
    res.status(401).send('Not authorized');
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
