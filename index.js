const { Telegraf, Markup } = require('telegraf');
const { allowedUsers, ownerId } = require('./config.js'); 
const { startMessage, imageLink, aboutMessage } = require('./messages.js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

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
        [Markup.button.url('BOT OWNER', `t.me/${ctx.from.username}`)] 
      ])
    );
  } else {
    // Regular user information
    ctx.replyWithHTML(aboutMessage + '\n\n' +
      `<b>This bot is built using the Telegraf library.</b>\n\n` +
      '*This bot is designed to help you easily burn subtitles into your videos.*',
      Markup.inlineKeyboard([
        [Markup.button.url('BOT OWNER', `t.me/${ctx.from.username}`)] 
      ])
    );
  }
});

// Video file handler
// Video file handler
bot.on('video', (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const videoFile = ctx.update.message.video.file_id;
  const videoPath = `/tmp/${videoFile}.mp4`;

  console.log("Received video file from user:", userId);

  // Download the video file
  ctx.telegram.getFile(videoFile).then(file => {
    const filePath = file.file_path;
    const stream = ctx.telegram.downloadFile(filePath);
    const writer = fs.createWriteStream(videoPath);
    stream.pipe(writer);

    // Wait for the file to be downloaded
    writer.on('finish', () => {
      // Prompt user for subtitles
      ctx.reply('Please provide the subtitles (text or file)');

      // Handle subtitles input
      bot.on('text', (ctx) => {
        const subtitlesText = ctx.update.message.text;
        const subtitlesPath = `/tmp/subtitles.srt`;
        fs.writeFileSync(subtitlesPath, subtitlesText);

        // Prompt user for custom logo
        ctx.reply('Please send your custom logo');

        // Handle custom logo input
        bot.on('photo', (ctx) => {
          const logoFile = ctx.update.message.photo[ctx.update.message.photo.length - 1].file_id;
          const logoPath = `/tmp/${logoFile}.png`;

          ctx.telegram.getFile(logoFile).then(file => {
            const filePath = file.file_path;
            const stream = ctx.telegram.downloadFile(filePath);
            const writer = fs.createWriteStream(logoPath);
            stream.pipe(writer);

            writer.on('finish', () => {
              // Burn subtitles into video
              const resolution = '1280x720'; 
              const depth = '-b:v 1500k -b:a 128k'; 
              const outputPath = `/tmp/output_${videoFile}.mp4`;

              const ffmpegCommand = `ffmpeg -i "${videoPath}" -i "${logoPath}" -filter_complex "[1][0]scale2ref=w=iw/5:h=ow/mdar[logo][video];[video][logo]overlay=W-w-10:10,subtitles=${subtitlesPath}:force_style='FontName=/tmp/font.ttf,FontSize=20',scale=${resolution}" ${depth} -c:v libx264 -crf 31 -preset medium -r 23.976 -b:v 1500k -b:a 128k "${outputPath}"`;

              ffmpeg(ffmpegCommand)
                .on('end', () => {
                  console.log('Subtitle burning complete');

                  // Send the output video file
                  ctx.replyWithVideo(outputPath, {
                    caption: 'Subtitle burned into video!'
                  });
                })
                .on('error', (err) => {
                  console.error('Error burning subtitles:', err);
                  ctx.reply('Error burning subtitles. Please try again.');
                });
            });
          });
        });
      });
    });
  });
});
