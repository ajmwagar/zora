const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const config = require("../config.json");
const bugs = require("../bugs.json");

const talkedRecently = new Set();

var shopItems = {
    Heart: {
        Name: "Heart",
        Description: "Adds a ❤️ to your inventory, can be used in battles",
        Price: 500,
        Icon: "❤️"
    },
    Mana: {
        Name: "Mana",
        Description: "Adds a 🌀 to your inventory, increases the chance to win battles",
        Price: 1000,
        Icon: "🌀"
    }
};

var spinningImg = {
    attachment: "./src/images/zslotsSpinning.gif",
    name: "zslotsSpinning.gif"
};
var winImg = {
    attachment: "./src/images/zslotsWin.gif",
    name: "zslotsWin.gif"
};
var loseImg = {
    attachment: "./src/images/zslotsLose.gif",
    name: "zslotsLose.gif"
};

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
    if (command === "profile") {
        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setThumbnail(message.member.user.avatarURL)
            .setTitle(`${message.member.user.username}'s profile`)
            .addField(
                "Level:",
                `${cuser.level}`,
                true
            )
            .addField(
                "XP:",
                `${cuser.xp}`,
                true
            )
            .addField("Inventory Contents Below:", "⏬", true)
            .addField(
                "💰 ZCoins: 💰",
                `${cuser.zcoins}`,
                true
            )
            .setFooter(
                `XP until next level: ${Math.round(
          Math.pow(
            100,
            cuser.level / 10 + 1
          )
        )}`,
                client.user.avatarURL
            );
        message.channel
            .send({
                embed
            })
            .then(() => {
                var userInventory =
                    cuser.inventory;

                if (userInventory.length > 0) {
                    const embed = new Discord.RichEmbed()
                        .setColor("#FF7F50")
                        .setTitle(userInventory.join(" "));
                    message.channel.send({
                        embed
                    });
                }
            });
    } else if (command === "daily") {
        if (talkedRecently.has(message.author.id)) {
            message.channel.send(
                "Wait 24 hours before using this again! - " + message.author
            );
        } else {
            if (cuser.VIP === false) {
                // give normal users 500 zcoins
                UserM.findById(message.author.id, function (err, user) {
                    user.zcoins += 500;
                    user.save();
                    const embed = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .setColor("#FF7F50")
                        .setTitle(`Gave ${message.member.user.username} 500 ZCoins!`)
                        .addField(
                            "Current Balance:",
                            `${cuser.zcoins}`,
                            true
                        );
                    message.channel.send({
                        embed
                    });
                });
            } else {
                // give VIP users 5000 zcoins
                UserM.findById(message.author.id, function (err, user) {
                    user.zcoins += 5000;
                    user.save();
                    const embed = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .setColor("#FF7F50")
                        .setTitle(
                            `⭐[VIP] Gave ${message.member.user.username} 5000 ZCoins! [VIP]⭐`
                        )
                        .addField(
                            "Current Balance:",
                            `${cuser.zcoins}`,
                            true
                        );
                    message.channel.send({
                        embed
                    });
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
        if (cuser.zcoins >= 250) {
            var slotstate = Math.random() >= 0.8;
            message.channel
                .send("Spending 250 ZCoins on slots!", {
                    file: spinningImg
                })
                .then(msg => {
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
                        UserM.findById(message.author.id, function (err, user) {
                            user.zcoins += 500;
                            user.save();
                        });

                    }

                    function lose() {
                        msg.delete();
                        message.channel.send("You lost 250 ZCoins! - " + message.author, {
                            file: loseImg
                        });
                        UserM.findById(message.author.id, function (err, user) {
                            user.zcoins -= 250;
                            user.save();
                        });

                    }
                });
        }
    } else if (command === "shop") {
        var itemNames = Object.keys(shopItems);
        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setTitle(`🛒 Welcome ${message.member.user.username} to the shop 🛒`)
            .setDescription(
                `We have wares if you got coin! ZCoin to be precise! Type ${
          cserver.prefix
        }buy <item>`
            )
            .addField(
                "Current Balance:",
                `${cuser.zcoins}`,
                true
            );
        message.channel
            .send({
                embed
            })
            .then(() => {
                itemNames.forEach(function (item) {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: item,
                            description: shopItems[item].Description,
                            fields: [{
                                name: "Price:",
                                value: `${shopItems[item].Price} ZCoins 💰`
                            }]
                        }
                    });
                });
            });
    } else if (command === "buy") {
        var item = args[0];
        if (shopItems[item]) {
            if (cuser.zcoins >= shopItems[item].Price) {
                UserM.findById(message.author.id, function (err, user) {
                    user.zcoins -= shopItems[item].Price;
                    user.inventory.push(
                        "[ " + shopItems[item].Icon + " - " + shopItems[item].Name + " ]"
                    );
                    user.save();
                });
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
        var edit = await message.channel.send("Browsing Forbes... (please be patient, this might take a while!)");

        // Get from database and sort!
        const getSort = () => {
            return UserM.find({}).sort({
                zcoins: -1
            }).exec()
        }

        var sorted = await getSort();

        // Default to 100
        var top = parseInt(args[0]) || 25;

        console.log(sorted);

        // Setup embed
        let embed = new Discord.RichEmbed()
            .setTitle("💰 Forbes richest " + top + " 💰")
            .setAuthor(client.user.username + " - FORBES", client.user.avatarURL)
            .setColor(15844367);

        // Add fields
        var counter = 1;
        for (var usr in sorted) {
            var profile = sorted[counter - 1];
            if (profile) {
                if (counter <= top && counter <= 25) {
                    if (counter === 1) {
                        embed.addField(
                            counter +
                            ". 🥇 " +
                            profile.username + " 🥇",
                            "Level " + profile.level + "   |   Zcoins: " + profile.zcoins
                        );
                    } else if (counter === 2) {
                        embed.addField(
                            counter +
                            ". 🥈 " +
                            profile.username + " 🥈",
                            "Level " + profile.level + "   |   Zcoins: " + profile.zcoins
                        );
                    } else if (counter === 3) {
                        embed.addField(
                            counter +
                            ". 🥉 " +
                            profile.username + " 🥉",
                            "Level " + profile.level + "   |   Zcoins: " + profile.zcoins
                        );
                    } else {
                        embed.addField(
                            counter +
                            ". " +
                            profile.username,
                            "Level " + profile.level + "   |   Zcoins: " + profile.zcoins
                        );
                    }
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
        if (obj.hasOwnProperty(key)) sortable.push([key, obj[key]]); // each item is an array in format [key, value]

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