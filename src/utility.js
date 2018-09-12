const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const config = require("../config.json");
const bugs = require("../bugs.json");

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
  if (command === "dice") {
    sides = parseInt(args[0]);
    message.channel.send(
      `🎲 Rolled a ${sides} sided dice! Result: **${Math.round(
        Math.random() * (sides + 1)
      )}** 🎲`
    );
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
  } else if (command === "math") {
    var result = 0;
    var input = args.join("");
    result = eval(input);
    if (result != "Infinity") {
      message.channel.send(`🖥️ Math - Result: **${result}** 🖥️`);
    } else {
      message.channel.send(`🖥️ WTF you tryin' to do M8! >:( 🖥️`);
    }
  } else if (command === "bug2") {
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

  }
}

module.exports = {
  bot
};