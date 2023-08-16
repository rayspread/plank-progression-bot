import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS plank_progression (
                user_id INTEGER PRIMARY KEY,
                duration INTEGER NOT NULL
            );
        `);
    } finally {
        client.release();
    }
};
