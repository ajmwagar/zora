const Discord = require("discord.js");
const axios = require('axios');

const config = require("./config.json");

async function bot(client, message, command, args) {
    if (command === "dice") {
        sides = parseInt(args[0])
        message.channel.send(`🎲 Rolled a ${sides} sided dice! Result: **${Math.round((Math.random() * (sides + 1)))}** 🎲`);
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
            .setColor(0x00AE86)
            .setImage("https://i.imgur.com/T68U30V.gif")
        message.channel.send({
            embed
        });
    }
}

module.exports = {
    bot
};