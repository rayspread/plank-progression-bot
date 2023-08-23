import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, getUser, updateUser, createUser } from './database';
import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!BOT_TOKEN || !DATABASE_URL) {
    throw new Error('BOT_TOKEN or DATABASE_URL is not defined!');
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(userId);
    if (user) {
        ctx.reply('Добро пожаловать обратно в Plank Progression!');
    } else {
        createUser(userId);
        ctx.reply('Добро пожаловать в Plank Progression! Начните с 1 минуты планки и добавляйте 10 секунд каждый день.');
    }
});

bot.command('status', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(userId);
    const time = user ? user.plank_time : 60;
    ctx.reply(`Ваш текущий рекорд планки: ${time} секунд.`);
});

bot.command('increase', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await getUser(userId);
    const newTime = (user ? user.plank_time : 60) + 10;

    if (user) {
        await updateUser(userId, newTime);
    } else {
        await createUser(userId);
        await updateUser(userId, newTime);
    }

    ctx.reply(`Отлично! Ваш новый рекорд планки: ${newTime} секунд.`);
});

bot.command('reset', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await updateUser(userId, 60);
    ctx.reply('Ваш рекорд планки был сброшен до 1 минуты.');
});

bot.launch();

// Инициализация базы данных
try {
    initializeDatabase();
} catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
}
