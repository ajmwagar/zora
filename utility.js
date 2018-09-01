const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const config = require("./config.json");
const bugs = require("./bugs.json");

async function bot(client, message, command, args) {
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
    var input = args.join();
    result = eval(input);
    if (result != "Infinity") {
      message.channel.send(`🖥️ Math - Result: **${result}** 🖥️`);
    } else {
      message.channel.send(`🖥️ WTF you tryin' to do M8! >:( 🖥️`);
    }
  } else if (command === "bug") {
    var description = args.join(" ");
    if (description) {

      var defaultConfig = {
        description: "",
      };
      if (!bugs.servers.hasOwnProperty(message.guild.id))
        bugs.servers[message.guild.id] = {
          users: {}
        }
      bugs.servers[message.guild.id].users[message.author.id] = description;

      fs.writeFileSync("./bugs.json", JSON.stringify(bugs));

      bugs.servers[message.guild.id] = description;
      message.channel.send(`Thank you for your contribution! The issue will be fixed soon!`);
    } else {
      message.channel.send(`Please add a description of the problem!`);
    }
  }
}

module.exports = {
  bot
};