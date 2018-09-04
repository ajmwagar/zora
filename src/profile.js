const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const config = require("../config.json");
const bugs = require("../bugs.json");

const talkedRecently = new Set();

var spinningImg = {
    attachment: './src/images/zslotsSpinning.gif',
    name: 'zslotsSpinning.gif'
}
var winImg = {
    attachment: './src/images/zslotsWin.gif',
    name: 'zslotsWin.gif'
}
var loseImg = {
    attachment: './src/images/zslotsLose.gif',
    name: 'zslotsLose.gif'
}

async function bot(client, message, command, args) {
    if (command === "profile") {
        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setThumbnail(message.member.user.avatarURL)
            .setTitle(`${message.member.user.username}'s profile`)
            .addField("Level:", `${config.userprofiles[message.member.user.id].level}`, true)
            .addField("XP:", `${config.userprofiles[message.member.user.id].xp}`, true)
            .addField("ZCoins:", `${config.userprofiles[message.member.user.id].zcoins}`, true)
            .setFooter(`XP until next level: ${Math.round(Math.pow(100, (((config.userprofiles[message.member.user.id].level) / 10) + 1)))}`, client.user.avatarURL)
        message.channel.send({
            embed
        });
    } else if (command === "daily") {
        if (talkedRecently.has(message.author.id)) {
            message.channel.send("Wait 24 hours before using this again! - " + message.author);
        } else {
            if (config.userprofiles[message.member.user.id].vip === false) {
                // give normal users 500 zcoins
                config.userprofiles[message.member.user.id].zcoins += 500;
                const embed = new Discord.RichEmbed()
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setColor("#FF7F50")
                    .setTitle(`Gave ${message.member.user.username} 500 ZCoins!`)
                    .addField("Current Balance:", `${config.userprofiles[message.member.user.id].zcoins}`, true)
                message.channel.send({
                    embed
                });
            } else {
                // give VIP users 5000 zcoins
                config.userprofiles[message.member.user.id].zcoins += 5000;
                const embed = new Discord.RichEmbed()
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setColor("#FF7F50")
                    .setTitle(`⭐[VIP] Gave ${message.member.user.username} 5000 ZCoins! [VIP]⭐`)
                    .addField("Current Balance:", `${config.userprofiles[message.member.user.id].zcoins}`, true)
                message.channel.send({
                    embed
                });
            }
            // Adds the user to the set so that they can't talk for a minute
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                // Removes the user from the set after a minute
                talkedRecently.delete(message.author.id);
            }, 86400000);
        }
    } else if (command === "slots") {
        var slotstate = Math.random() >= 0.2;
        message.channel.send("Spending 250 ZCoins on slots!", {
            file: spinningImg
        }).then((msg) => {
            if (slotstate == true) {
                setTimeout(win, 3000);
            } else {
                setTimeout(lose, 3000);
            }

            function win() {
                msg.delete();
                message.channel.send("You won 500 ZCoins! - " + message.author, {
                    file: winImg
                });
                config.userprofiles[message.member.user.id].zcoins += 500;
            }

            function lose() {
                msg.delete();
                message.channel.send("You lost 250 ZCoins! - " + message.author, {
                    file: loseImg
                });
                config.userprofiles[message.member.user.id].zcoins -= 250;
            }
        });

    }
}

module.exports = {
    bot
};