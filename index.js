const { Telegraf, Markup } = require('telegraf');
const { allowedUsers, ownerId } = require('./config.js'); // Add ownerId to config
const { startMessage, imageLink, aboutMessage } = require('./messages.js');

const token = '6449794069:AAFgGjUNrBxivnGq8kjZIxDa9d3m2iNjCEc'; 
const bot = new Telegraf(token);

// Start command handler
bot.start((ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  console.log("Received /start command from user:", userId);
  console.log("Allowed users:", allowedUsers);

  if (allowedUsers.includes(userId)) {
    ctx.replyWithPhoto(imageLink, {
      caption: startMessage, 
      parse_mode: 'HTML', 
      disable_web_page_preview: true
    });
  } else {
    ctx.reply('You are not authorized to use this bot.');
  }
});

// About command handler
bot.command('about', (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  console.log("Received /about command from user:", userId);

  // Check if user is the owner
  if (userId === ownerId) {
    // Owner specific information
    ctx.replyWithHTML(aboutMessage + '\n\n' +
      `<b>This bot is built using the ffmpeg library.</b>\n\n` +
      '*How to use the Subtitle Burner Bot:*\n' +
      '1. Send a video file to the bot.\n' +
      '2. The bot will prompt you for the subtitles (you can provide them as text or a separate file).\n' +
      '3. The bot will then burn the subtitles into your video and send you the result.',
      Markup.inlineKeyboard([
        [Markup.button.url('BOT OWNER', `t.me/${ctx.from.username}`)] // Replace with your username
      ])
    );
  } else {
    // Regular user information
    ctx.replyWithHTML(aboutMessage + '\n\n' +
      `<b>This bot is built using the Telegraf library.</b>\n\n` +
      '*This bot is designed to help you easily burn subtitles into your videos.*',
      Markup.inlineKeyboard([
        [Markup.button.url('BOT OWNER', `t.me/${ctx.from.username}`)] // Replace with your username
      ])
    );
  }
});

// Start the bot
bot.launch();

// Handle errors
bot.catch(err => {
  console.error('Error in bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
