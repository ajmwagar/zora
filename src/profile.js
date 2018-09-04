const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const config = require("../config.json");
const bugs = require("../bugs.json");

async function bot(client, message, command, args) {
    if (command === "profile") {
        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setThumbnail(message.member.user.avatarURL)
            .setTitle(`${message.member.user.username}'s profile`)
            .addField("Level:", `${config.userprofiles[message.member.user.id].level}`, true)
            .addField("XP:", `${config.userprofiles[message.member.user.id].xp}`, true)
            .setFooter(`XP until next level: ${Math.round(Math.pow(100, (((config.userprofiles[message.member.user.id].level) / 10) + 1)))}`, client.user.avatarURL)
        message.channel.send({
            embed
        });
    }
}

module.exports = {
    bot
};