const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const chalk = require("chalk");
const Config = require("./config.json");
let Database = JSON.parse(fs.readFileSync("./Database.json", "utf8"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

function saveDatabase() {
  fs.writeFileSync("./Database.json", JSON.stringify(Database, null, 2));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();
  //help
  if (command === `${Config.prefix}help`) {
    const embedhelp = new EmbedBuilder().setColor(Config.color).setTitle("Help")
      .setDescription(`
    ${Config.prefix}setchannel <#channel>
    ${Config.prefix}setimage <attach image>
    ${Config.prefix}setreaction <emoji>
    `);
    return message.reply({ embeds: [embedhelp] });
  }
  //setchannel
  if (command === `${Config.prefix}setchannel`) {
    const mentioned = message.mentions.channels.first();
    if (!mentioned) return message.reply("يرجى منشن القناة مثل: #channel");
    Database.ChannelID = mentioned.id;
    saveDatabase();
    return message.reply(`تم تعيين القناة إلى ${mentioned.name}`);
  }
  //setimage
  if (command === `${Config.prefix}setimage`) {
    const attachment = message.attachments.first();
    if (!attachment) return message.reply("ارفق صورة مع الأمر.");
    const response = await fetch(attachment.url);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync("./Image.png", Buffer.from(buffer));
    saveDatabase();
    return message.reply("تم تعيين الصورة بنجاح.");
  }
  //setreaction
  if (command === `${Config.prefix}setreaction`) {
    if (!args[0]) return message.reply("يرجى كتابة الإيموجي بعد الأمر.");
    Database.Reaction = args[0];
    saveDatabase();
    return message.reply(`تم تعيين الرياكشن إلى ${args[0]}`);
  }
  //feedback
  if (message.channel.id === Database.ChannelID && Database.ImageURL) {
    try {
      const image = await loadImage(Database.ImageURL);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0, image.width, image.height);

      const avatarURL = message.author.displayAvatarURL({
        extension: "png",
        size: 128,
      });
      const avatar = await loadImage(avatarURL);

      const avatarSize = 250;
      const avatarX = 40;
      const avatarY = 25;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const text = await replaceMentions(message);
      const boxX = 458;
      const boxY = 150;
      const boxWidth = 410;
      const boxHeight = 185;
      let fontSize = 50;
      let lines = [];
      let lineHeight = 0;

      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      while (fontSize > 10) {
        ctx.font = `${fontSize}px Arial`;
        lines = wrapText(ctx, text, boxWidth);
        lineHeight = fontSize * 1.3;
        if (lines.length * lineHeight <= boxHeight) break;
        fontSize -= 1;
      }

      const startY =
        boxY + (boxHeight - lines.length * lineHeight) / 2 + fontSize * 0.2;

      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + boxWidth, startY + i * lineHeight);
      });

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: "feedback.png",
      });

      const messagesent = await message.channel.send({
        content: `شكراً لتقييمك <@${message.author.id}>`,

        files: [attachment],
      });

      await messagesent.react(Database.Reaction);
    } catch (err) {
      console.error("خطأ في تحميل الصورة:", err);
    }
    message.delete();
  }
});

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let word of words) {
    const testLine = line + word + " ";
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

async function replaceMentions(message) {
  let content = message.content;

  for (const user of message.mentions.users.values()) {
    const member = await message.guild.members.fetch(user.id).catch(() => null);
    const name = member?.nickname || user.username;
    const mentionRegex = new RegExp(`<@!?${user.id}>`, "g");
    content = content.replace(mentionRegex, name);
  }

  content = content.replace(/<@!?everyone>/g, "@everyone");
  content = content.replace(/<@!?here>/g, "@here");

  for (const role of message.mentions.roles.values()) {
    const mentionRegex = new RegExp(`<@&${role.id}>`, "g");
    content = content.replace(mentionRegex, `@${role.name}`);
  }

  return content;
}
client.once("ready", () => {
  console.log(chalk.green(`bot has been logged in as ${client.user.tag}`));

  console.log(
    chalk.blueBright(String.raw`



 ██▒   █▓ ██▓  ██████  ██▓ ▒█████   ███▄    █                                  
▓██░   █▒▓██▒▒██    ▒ ▓██▒▒██▒  ██▒ ██ ▀█   █                                  
 ▓██  █▒░▒██▒░ ▓██▄   ▒██▒▒██░  ██▒▓██  ▀█ ██▒                                 
  ▒██ █░░░██░  ▒   ██▒░██░▒██   ██░▓██▒  ▐▌██▒                                 
   ▒▀█░  ░██░▒██████▒▒░██░░ ████▓▒░▒██░   ▓██░                                 
   ░ ▐░  ░▓  ▒ ▒▓▒ ▒ ░░▓  ░ ▒░▒░▒░ ░ ▒░   ▒ ▒                                  
   ░ ░░   ▒ ░░ ░▒  ░ ░ ▒ ░  ░ ▒ ▒░ ░ ░░   ░ ▒░                                 
     ░░   ▒ ░░  ░  ░   ▒ ░░ ░ ░ ▒     ░   ░ ░                                  
      ░   ░        ░   ░      ░ ░           ░                                  
 ▄▄▄ ░     ██▀███  ▄▄▄█████▓     ██████ ▄▄▄█████▓ █    ██ ▓█████▄  ██▓ ▒█████  
▒████▄    ▓██ ▒ ██▒▓  ██▒ ▓▒   ▒██    ▒ ▓  ██▒ ▓▒ ██  ▓██▒▒██▀ ██▌▓██▒▒██▒  ██▒
▒██  ▀█▄  ▓██ ░▄█ ▒▒ ▓██░ ▒░   ░ ▓██▄   ▒ ▓██░ ▒░▓██  ▒██░░██   █▌▒██▒▒██░  ██▒
░██▄▄▄▄██ ▒██▀▀█▄  ░ ▓██▓ ░      ▒   ██▒░ ▓██▓ ░ ▓▓█  ░██░░▓█▄   ▌░██░▒██   ██░
 ▓█   ▓██▒░██▓ ▒██▒  ▒██▒ ░    ▒██████▒▒  ▒██▒ ░ ▒▒█████▓ ░▒████▓ ░██░░ ████▓▒░
 ▒▒   ▓▒█░░ ▒▓ ░▒▓░  ▒ ░░      ▒ ▒▓▒ ▒ ░  ▒ ░░   ░▒▓▒ ▒ ▒  ▒▒▓  ▒ ░▓  ░ ▒░▒░▒░ 
  ▒   ▒▒ ░  ░▒ ░ ▒░    ░       ░ ░▒  ░ ░    ░    ░░▒░ ░ ░  ░ ▒  ▒  ▒ ░  ░ ▒ ▒░ 
  ░   ▒     ░░   ░   ░         ░  ░  ░    ░       ░░░ ░ ░  ░ ░  ░  ▒ ░░ ░ ░ ▒  
      ░  ░   ░                       ░              ░        ░     ░      ░ ░  
                                                           ░                                             
                                               
                                            
`)
  );
  console.log(chalk.yellow(`Developed by: Khaton`));
  console.log(chalk.yellow(`Version: 1.0.0`));
  console.log(
    chalk.yellow(`Support Server: `) + chalk.blue(`https://discord.gg/vas`)
  );
  console.log(chalk.yellow(`© 2025 Vision Art Studios. All rights reserved.`));
});

client.login(Config.token);
