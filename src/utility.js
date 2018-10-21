const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const util = require('util');
const os = require('os');

const config = require("../config.json");

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
  if (command === "dice") {
    sides = parseInt(args[0]);
    message.channel.send(
      `🎲 Rolled a ${sides} sided dice! Result: **${Math.round(
        Math.random() * (sides + 1)
      )}** 🎲`
    );
  } else if (command === "info" || command === "bot-info") {

    var memory = 0;
    var memoryTotal = 0
    memory = util.inspect(process.memoryUsage().heapUsed);
    memoryTotal = util.inspect(process.memoryUsage().heapTotal);
    systemMemory = os.freemem();
    systemMemoryTotal = os.totalmem();

    const embed = new Discord.RichEmbed()
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor("#FF7F50")
      .setThumbnail(client.user.avatarURL)
      .setTitle(`🔶 Bot Information 🔶`)
      .setDescription(`Zora is the most flexible and easy to use bot available to manage your Discord Server! Actively maintained and constantly being improved, our bot offers many unique features. Whether you just need a simple music bot, or you want to browse Reddit and StackOverflow from the comfort of your Discord server, Zora is the bot for you!\n\n💬 **Invite:** 💬\n[INVITE ME](https://discordapp.com/oauth2/authorize?client_id=478616471640080395&permissions=8&scope=bot)`)
      .addField(`📚 Info 📚`, `**Prefix:** ` + '`' + cserver.prefix + '`' + `\n**Vote:** [DiscordBots.org](https://discordbots.org/bot/478616471640080395/vote)\n**Website:** [ZoraBOT](https://zora.netlify.com)`, true)
      .addField("💻 Developers 💻", `**DekuTree#0460**\n**ajmwagar#6469**`, true)
      .addField("🏙️ Population 🏙️", `**Guilds:** ${client.guilds.size}\n**Users:** ${client.users.size}`, true)
      .addField("💾 Performance 💾", `**System Memory:** ${Math.round(((systemMemory / (1048576)) * 10) / 10)}Mb / ${Math.round(((systemMemoryTotal / (1048576)) * 10) / 10)}Mb\n**Allocated Memory:** ${Math.round(((memory / (1048576)) * 10) / 10)}Mb / ${Math.round(((memoryTotal / (1048576)) * 10) / 10)}Mb`, true)
      .setFooter(
        `Powered by Discord.js and MongoDB`,
        client.user.avatarURL
      );
    message.channel
      .send({
        embed
      })
  } else if (command === "coinflip") {
    var coinstate = Math.random() >= 0.5;
    if (coinstate == true) {
      message.channel.send(`❓ A coin was flipped! Result: **Heads** ❓`);
    } else {
      message.channel.send(`❓ A coin was flipped! Result: **Tails** ❓`);
    }
  } else if (command === "dab") {
    const embed = new Discord.RichEmbed()
      .setTitle("D A B O N t h O s E H a T E r S")
      .setColor(0x00ae86)
      .setImage("https://i.imgur.com/T68U30V.gif");
    message.channel.send({
      embed
    });
  }
  /* else if (command === "math") {
      var result = 0;
      var input = args.join("");
      result = eval(input);
      if (result != "Infinity") {
        message.channel.send(`🖥️ Math - Result: **${result}** 🖥️`);
      } else {
        message.channel.send(`🖥️ WTF you tryin' to do M8! >:( 🖥️`);
      }
    }*/
  else if (command === "bug") {
    var description = args.join(" ");
    if (description) {
      client.guilds.get('485567430014533653').channels.get('486605010403328030').send({
        embed: {
          color: 2067276,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: `🐛 ${message.member.user.username} has reported a bug! 🐛`,
          description: `**Description:** ${description}`,
          fields: [{
              name: "Guild Name:",
              value: message.guild.name
            },
            {
              name: "Size:",
              value: message.guild.memberCount + " members"
            },
            {
              name: "Guild ID:",
              value: message.guild.id
            }, {
              name: "User ID:",
              value: message.member.user.id
            }
          ]
        }
      });
      message.channel.send(`Thank you for your contribution! The issue will be fixed soon!`);
    } else {
      message.channel.send(`Please add a description of the problem!`);
    }
  } else if (command === "support") {
    message.author.send("Support server invite: https://discord.gg/nDwfeKt")
    message.reply("please check your direct messages.")
  } else if (command === "xkcd") {

    var xkcd = axios.create({
      // Get data from weather API
      baseURL: "https://xkcd.com/info.0.json",
      headers: {
        Accept: "application/json"
      }
    });

    if (args[0] === undefined) {
      number = args[0];
    } else {
      number = args[0].toLowerCase().trim();
    }

    if (number === 'random') {
      xkcd = axios.create({
        // Get data from weather API
        baseURL: `https://xkcd.com/${Math.floor(Math.random() * 2001)}/info.0.json`,
        headers: {
          Accept: "application/json"
        }
      });
    } else if (number != undefined) {
      xkcd = axios.create({
        // Get data from weather API
        baseURL: `https://xkcd.com/${number}/info.0.json`,
        headers: {
          Accept: "application/json"
        }
      });
    }

    const m = await message.channel.send("Getting XKCD comic...");

    xkcd.get("").then(res => {
      const embed = new Discord.RichEmbed()
        .setTitle(res.data.safe_title)
        .setAuthor(client.user.username + " - XKCD", client.user.avatarURL)
        .setColor(0x00AE86)
        .setDescription(`Day: ${res.data.day}`)
        .setFooter(" - XKCD -", client.user.avatarURL)
        .setImage(res.data.img)

        .setTimestamp()
        .setURL(res.data.img)

      m.edit({
        embed
      });
    });


  }
}

module.exports = {
  bot
};