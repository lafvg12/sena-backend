// const { Pool } = require('pg');
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    user: 'root',
    database: 'login',
    password: 'example',
    port: 5434,
  });

export async function clientDB (){
    const client = await pool.connect();
    return client;
}
 

