import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.PORT_AWS,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('pool', pool);
export async function clientDB() {
    const client = await pool.connect();
    return client;
}

async function testConnection() {
    try {
        const client = await clientDB();
        console.log("Connected to the database");
        client.release();
    } catch (err) {
        console.error("Error connecting to the database", err);
    }
}

testConnection();
