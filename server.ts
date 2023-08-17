import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase } from './database';

import { Telegraf } from 'telegraf';
import pgPromise from 'pg-promise';

const BOT_TOKEN = process.env.BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!BOT_TOKEN || !DATABASE_URL) {
    throw new Error('BOT_TOKEN or DATABASE_URL is not defined!');
}

const bot = new Telegraf(BOT_TOKEN);
const db = pgPromise()({ connectionString: DATABASE_URL });

// Создание таблицы при первом запуске
db.none(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    plank_time INTEGER DEFAULT 60
)`);

bot.start((ctx) => ctx.reply('Добро пожаловать в Plank Progression! Начните с 1 минуты планки и добавляйте 10 секунд каждый день.'));

bot.command('status', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await db.oneOrNone('SELECT plank_time FROM users WHERE user_id = $1', [userId]);
    const time = user ? user.plank_time : 60;
    ctx.reply(`Ваш текущий рекорд планки: ${time} секунд.`);
});

bot.command('increase', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await db.oneOrNone('SELECT plank_time FROM users WHERE user_id = $1', [userId]);
    const newTime = (user ? user.plank_time : 60) + 10;

    if (user) {
        await db.none('UPDATE users SET plank_time = $1 WHERE user_id = $2', [newTime, userId]);
    } else {
        await db.none('INSERT INTO users(user_id, plank_time) VALUES($1, $2)', [userId, newTime]);
    }

    ctx.reply(`Отлично! Ваш новый рекорд планки: ${newTime} секунд.`);
});

bot.command('reset', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await db.none('UPDATE users SET plank_time = 60 WHERE user_id = $1', [userId]);
    ctx.reply('Ваш рекорд планки был сброшен до 1 минуты.');
});

bot.launch();

initializeDatabase().catch(error => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
});
