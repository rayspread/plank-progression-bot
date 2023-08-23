import pgPromise from 'pg-promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined!');
}

const db = pgPromise()({ connectionString: DATABASE_URL });

export async function initializeDatabase() {
    await db.none(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE,
        plank_time INTEGER DEFAULT 60
    )`);
}

export async function getUser(userId: number) {
    return await db.oneOrNone('SELECT plank_time FROM users WHERE user_id = $1', [userId]);
}

export async function createUser(userId: number) {
    await db.none('INSERT INTO users(user_id) VALUES($1)', [userId]);
}

export async function updateUser(userId: number, newTime: number) {
    await db.none('UPDATE users SET plank_time = $1 WHERE user_id = $2', [newTime, userId]);
}
