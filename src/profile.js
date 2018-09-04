const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const config = require("../config.json");
const bugs = require("../bugs.json");

const talkedRecently = new Set();

var shopItems = {
    Heart: {
        Name: 'Heart',
        Description: 'Adds a ❤️ to your inventory, can be used in battles',
        Price: 500,
        Icon: '❤️'
    },
    Mana: {
        Name: 'Mana',
        Description: 'Adds a 🌀 to your inventory, increases the chance to win battles',
        Price: 1000,
        Icon: '🌀'
    }
}

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
            .addField("Inventory Contents Below:", "⏬", true)
            .addField("💰 ZCoins: 💰", `${config.userprofiles[message.member.user.id].zcoins}`, true)
            .setFooter(`XP until next level: ${Math.round(Math.pow(100, (((config.userprofiles[message.member.user.id].level) / 10) + 1)))}`, client.user.avatarURL)
        message.channel.send({
            embed
        }).then(() => {
            var userInventory = config.userprofiles[message.member.user.id].inventory;

            if (userInventory.length > 0) {
                const embed = new Discord.RichEmbed()
                    .setColor("#FF7F50")
                    .setTitle(userInventory.join(" "))
                message.channel.send({
                    embed
                })

            }
        });

    } else if (command === "daily") {
        if (talkedRecently.has(message.author.id)) {
            message.channel.send("Wait 24 hours before using this again! - " + message.author);
        } else {
            if (config.userprofiles[message.member.user.id].VIP === false) {
                // give normal users 500 zcoins
                config.userprofiles[message.member.user.id].zcoins += 500;
                fs.writeFile("./config.json", JSON.stringify(config));
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
                fs.writeFile("./config.json", JSON.stringify(config));
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
        if (config.userprofiles[message.member.user.id].zcoins >= 250) {
            var slotstate = Math.random() >= 0.8;
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
                    fs.writeFile("./config.json", JSON.stringify(config));
                }

                function lose() {
                    msg.delete();
                    message.channel.send("You lost 250 ZCoins! - " + message.author, {
                        file: loseImg
                    });
                    config.userprofiles[message.member.user.id].zcoins -= 250;
                    fs.writeFile("./config.json", JSON.stringify(config));
                }
            });
        }
    } else if (command === "shop") {
        var itemNames = Object.keys(shopItems)
        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setTitle(`🛒 Welcome ${message.member.user.username} to the shop 🛒`)
            .setDescription(`We have wares if you got coin! ZCoin to be precise! Type ${config.serverconfigs[message.guild.id].prefix}buy <item>`)
            .addField("Current Balance:", `${config.userprofiles[message.member.user.id].zcoins}`, true)
        message.channel.send({
            embed
        }).then(() => {
            itemNames.forEach(function (item) {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: item,
                        description: shopItems[item].Description,
                        fields: [{
                            name: "Price:",
                            value: `${shopItems[item].Price} ZCoins 💰`
                        }],
                    }
                });
            })
        });

    } else if (command === "buy") {
        var item = args[0];
        if (shopItems[item]) {
            if (config.userprofiles[message.member.user.id].zcoins >= shopItems[item].Price) {
                config.userprofiles[message.member.user.id].zcoins -= shopItems[item].Price;
                config.userprofiles[message.member.user.id].inventory.push("[ " + shopItems[item].Icon + " - " + shopItems[item].Name + " ]");
                fs.writeFile("./config.json", JSON.stringify(config));
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: item,
                        description: `✅ ${message.author} purchased 1 ${item}`
                    }
                });
            } else {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: item,
                        description: `⛔ ${message.author} you don't have enough ZCoins!`
                    }
                });
            }
        }
    } else if (command === "forbes") {
        // No lag
        var edit = await message.channel.send("Browsing Forbes...");

        // Sort
        var sorted = sortProperties(config.userprofiles).reverse();


        // Default to 100
        var top = parseInt(args[0]) || 100;

        // Setup embed
        let embed = new Discord.RichEmbed().setTitle("Forbes richest " + top)
            .setAuthor(client.user.username + " - FORBES", client.user.avatarURL)
            .setColor(15844367);

        // Add fields
        var counter = 1;
        for (var usr in sorted) {
            var user = sorted[counter - 1];
            var profile;
            client.guilds.forEach(function (guild) {
                if (guild.members[user[0]]) {
                    profile = guild.members.get(user[0])
                }
                console.log(user[0])
            });

            if (profile) {

                if (counter <= top) {
                    embed.addField(counter + ". " + profile.user.username + ", Zcoins: " + user[1].zcoins, "Level " + user[1].level);
                    counter++;
                } else {
                    break;

                }
            }
        }

        // Send 
        edit.edit(embed);
    }
}

function sortProperties(obj) {
    // convert object into array
    var sortable = [];
    for (var key in obj)
        if (obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function (a, b) {
        var x = a[1].zcoins,
            y = b[1].zcoins;
        return x < y ? -1 : x > y ? 1 : 0;
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

module.exports = {
    bot
};