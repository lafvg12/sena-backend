import express from 'express';
import cors from 'cors';
import { clientDB } from './utils/db.js';
import { authorizationMiddleware } from './middleware/auth.js';
import 'dotenv/config';
import { generateHashPassword, verifyToken, signTokenJWT, comparePassword } from './utils/auth.js';

const app = express();
const port = process.env.PORT_LOCAL || 3002;

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
  const data = req.body;
  const { name, email, password } = data;
  const client = await clientDB();

  try {
    const passwordHashed = await generateHashPassword(password);
    const values = [email, name, passwordHashed];
    const query = 'INSERT INTO users (email, name, password) VALUES ($1, $2, $3)';
    await client.query(query, values);

    res.status(201).send('User created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

app.get('/users', authorizationMiddleware , async (req, res) => {
  const client = await clientDB();
  const qGetUsers = 'SELECT * FROM users';
  const allUsers = await client.query(qGetUsers);

  res.status(200).json(allUsers.rows);
});

app.post('/login', async (req, res) => {
  const data = req.body;
  const { email, password } = data;
  const client = await clientDB();

  try {
    const getuser = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(getuser, [email]);

    if (!result.rows.length) {
      return res.status(401).send('User not found');
    }

    const passwordHashed = await comparePassword(password, result.rows[0].password);

    if (passwordHashed) {
      const jwtToken = signTokenJWT({ usuario: email, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, process.env.SECRET_KEY);
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
    const query = 'DELETE FROM users WHERE id = $1';
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
  const { usuario, clave } = req.body;

  try {
    let passwordHashed = null;
    if (clave) {
      passwordHashed = await generateHashPassword(clave);
    }

    const query = `
      UPDATE users 
      SET 
        usuario = COALESCE($1, usuario), 
        clave = COALESCE($2, clave) 
      WHERE id = $3
    `;
    const values = [usuario, passwordHashed, userId];
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
