import { Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

let userPlankTime = 60; // начальное значение в секундах (1 минута)

bot.start((ctx) => ctx.reply('Добро пожаловать в Plank Progression!'));

bot.command('status', (ctx) => {
    ctx.reply(`Текущее время планки: ${userPlankTime} секунд.`);
});

bot.command('increase', (ctx) => {
    userPlankTime += 10;
    ctx.reply(`Теперь ваше время планки: ${userPlankTime} секунд.`);
});

bot.command('reset', (ctx) => {
    userPlankTime = 60;
    ctx.reply('Время планки сброшено до 1 минуты.');
});

bot.launch();
