import express from 'express';
import cors from 'cors';
import { clientDB } from './utils/db.js';
import { authorizationMiddleware } from './middleware/auth.js';
import 'dotenv/config';
import { generateHashPassword, verifyToken, signTokenJWT, comparePassword } from './utils/auth.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post('/register', async(req, res) => {
  const data = req.body;
  const client = await clientDB();

  try {
    const passwordHashed = await generateHashPassword(data.clave);
    const values = [data.usuario, passwordHashed];
    const query = 'INSERT INTO usuarios (usuario, clave) VALUES ($1, $2)';
    await client.query(query, values);

    res.status(201).send('User created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

app.get('/users', authorizationMiddleware, async (req, res) => {
  const client = await clientDB();
  const qGetUsers = 'SELECT * FROM usuarios';
  const allUsers = await client.query(qGetUsers);

  res.status(200).json(allUsers.rows);
});

app.post('/login', async (req, res) => { 
  const data = req.body;
  const client = await clientDB();
  
  try {
    const getuser = 'SELECT * FROM usuarios WHERE usuario = $1';
    const user = await client.query(getuser, [data.usuario]);

    if(!user.rows.length){
      return res.status(401).send('User not found');
    }

    const passwordHashed = await comparePassword(data.clave, user.rows[0].clave)

    if (passwordHashed) {
      const jwtToken = signTokenJWT({ usuario: data.usuario, exp: Math.floor(Date.now() / 1000) + (60 * 60), }, process.env.SECRET_KEY);
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
    const isValid = verifyToken(token, process.env.SECRET_KEY);

    if (isValid) {
      res.status(200).send('Validated session');
    } else {
      res.status(401).send('Not authorized');
    }
  } catch (err) {
    res.status(401).send('Not authorized');
  }
});

app.delete('/users/:id', authorizationMiddleware, async (req, res) => {
  const client = await clientDB();
  const userId = req.params.id;

  try {
    const query = 'DELETE FROM usuarios WHERE id = $1';
    const result = await client.query(query, [userId]);

    if (result.rowCount === 0) {
      res.status(404).send('User not found');
    } else {
      res.status(200).send('User deleted successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

app.put('/users/:id', authorizationMiddleware, async (req, res) => {
  const client = await clientDB();
  const userId = req.params.id;
  const data = req.body;

  try {
    const passwordHashed = data.clave ? await generateHashPassword(data.clave) : null;
    const values = [data.usuario, passwordHashed, userId];
    const query = 'UPDATE usuarios SET usuario = COALESCE($1, usuario), clave = COALESCE($2, clave) WHERE id = $3';
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      res.status(404).send('User not found');
    } else {
      res.status(200).send('User updated successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
