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

var duelplayer = {
    opponent: [],
    player: [],
    battleStarted: false,
    opponentid: '',
    playerid: '',
    playerhealth: 100,
    opponenthealth: 100,
    player1: false,
    player2: false
};

var alive = true;
var timeout;

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
        item = item.charAt(0).toUpperCase() + item.substr(1);
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
    } else if (command === "duel") {
        function battleTimeout() {
            duelplayer = {
                opponent: [],
                player: [],
                battleStarted: false,
                opponentid: '',
                playerid: '',
                playerhealth: 100,
                opponenthealth: 100,
                player1: false,
                player2: false
            }
            message.channel.send({
                embed: {
                    color: 3447003,
                    title: item,
                    description: `⛔ ${message.author} No one joined the battle in time!`
                }
            });
        }
        duelplayer.battleStarted = false;
        if (duelplayer.player1 == false) {
            duelplayer.player1 = true;
            alive == true;
            duelplayer.player.push(message.member.user.username);
            duelplayer.playerid = message.member.user.id;
            timeout = setTimeout(battleTimeout, 30000)
            const embed = new Discord.RichEmbed()
                .setTitle("⚔️ A CHALLENGER HAS ARRIVED! ⚔️")
                .setAuthor(client.user.username, client.user.avatarURL)
                .setColor("#ff0000")
                .setDescription(`Type ${cserver.prefix}duel to join the battle! Ending in 30 seconds`)
                .setFooter("DUEL", client.user.avatarURL)
                .setThumbnail(message.member.user.avatarURL)
                .setTimestamp()
            message.channel.send({
                embed
            });
        } else {
            if (duelplayer.opponent.length == 0) {
                duelplayer.opponent.push(message.member.user.username);
                duelplayer.opponentid = message.member.user.id;
                clearTimeout(timeout);
                const embed = new Discord.RichEmbed()
                    .setTitle(`⚔️ ${message.member.user.username} HAS JOINED THE FIGHT! ⚔️`)
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setColor("#ff0000")
                    .setDescription(`Battle will start in 5 seconds!`)
                    .setFooter("DUEL", client.user.avatarURL)
                    .setThumbnail(message.member.user.avatarURL)
                    .setTimestamp()
                message.channel.send({
                    embed
                });
                setTimeout(startBattle, 5000)
            } else {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: item,
                        description: `⛔ ${message.author} someone has already joined this duel!`
                    }
                });
            }
        }

        async function startBattle() {
            duelplayer.battleStarted = true;
            const embed = new Discord.RichEmbed()
                .setTitle(`⚔️ ${duelplayer.opponent} VS ${duelplayer.player[0]} ⚔️`)
                .setAuthor(client.user.username, client.user.avatarURL)
                .setColor("#ff0000")
                .setDescription(`Combat log below:`)
                .setFooter("DUEL", client.user.avatarURL)
                .setTimestamp()
            await message.channel.send({
                embed
            });

        }
    } else if (command === "next") {
        function battle() {
            if (duelplayer.battleStarted == true) {
                if (Math.random() < 0.5) {
                    player1();

                } else {
                    player2();
                }

                function player1() {
                    // Attack hits!
                    let items = [];
                    UserM.findById(duelplayer.opponentid, function (err, user) {
                        items = items.concat(user.inventory)
                    });
                    if (items.includes("[ 🌀 - Mana ]")) {
                        // Remove 1 Mana
                        var index = items.indexOf("[ 🌀 - Mana ]");
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        let damage = Math.floor(Math.random() * 80) + 25
                        duelplayer.playerhealth -= damage;
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                title: item,
                                description: `🔥🌀 ${duelplayer.opponent}'s attack hit for ${damage} damage!`,
                                fields: [{
                                        name: `${duelplayer.opponent}'s health:`,
                                        value: `${duelplayer.opponenthealth}`
                                    },
                                    {
                                        name: `${duelplayer.player}'s health:`,
                                        value: `${duelplayer.playerhealth}`
                                    }
                                ]
                            }
                        });
                        UserM.findById(duelplayer.opponentid, function (err, user) {
                            user.xp += 800;
                            user.save();
                        });
                        duelplayer.battleStarted = true;

                        if (duelplayer.playerhealth <= 0) {
                            if (items.includes("[ ❤️ - Heart ]")) {
                                // Remove 1 Mana
                                var index = items.indexOf("[ ❤️ - Heart ]");
                                if (index > -1) {
                                    items.splice(index, 1);
                                }
                                duelplayer.playerhealth = 100;

                            } else {
                                alive == false;
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `💀 ${duelplayer.player} died! 💀`
                                    }
                                });
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `✨ ${duelplayer.opponent} IS VICTORIOUS! ✨`
                                    }
                                });
                                UserM.findById(duelplayer.opponentid, function (err, user) {
                                    user.xp += 5000;
                                    user.zcoins += 2500;
                                    user.save();
                                });
                                duelplayer = {
                                    opponent: [],
                                    player: [],
                                    battleStarted: false,
                                    opponentid: '',
                                    playerid: '',
                                    playerhealth: 100,
                                    opponenthealth: 100,
                                    player1: false,
                                    player2: false
                                }

                            }
                        }
                    } else {
                        let damage = Math.floor(Math.random() * 25)
                        duelplayer.playerhealth -= damage;
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                title: item,
                                description: `🔥 ${duelplayer.opponent}'s attack hit for ${damage} damage!`,
                                fields: [{
                                        name: `${duelplayer.opponent}'s health:`,
                                        value: `${duelplayer.opponenthealth}`
                                    },
                                    {
                                        name: `${duelplayer.player}'s health:`,
                                        value: `${duelplayer.playerhealth}`
                                    }
                                ]
                            }
                        });
                        UserM.findById(duelplayer.opponentid, function (err, user) {
                            user.xp += 500;
                            user.save();
                        });
                        duelplayer.battleStarted = true;

                        if (duelplayer.playerhealth <= 0) {
                            if (items.includes("[ ❤️ - Heart ]")) {
                                // Remove 1 Mana
                                var index = items.indexOf("[ ❤️ - Heart ]");
                                if (index > -1) {
                                    items.splice(index, 1);
                                }
                                duelplayer.playerhealth = 100;

                            } else {
                                alive == false;
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `💀 ${duelplayer.player} died! 💀`
                                    }
                                });
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `✨ ${duelplayer.opponent} IS VICTORIOUS! ✨`
                                    }
                                });
                                UserM.findById(duelplayer.opponentid, function (err, user) {
                                    user.xp += 5000;
                                    user.zcoins += 2500;
                                    user.save();
                                });
                                duelplayer = {
                                    opponent: [],
                                    player: [],
                                    battleStarted: false,
                                    opponentid: '',
                                    playerid: '',
                                    playerhealth: 100,
                                    opponenthealth: 100,
                                    player1: false,
                                    player2: false
                                }

                            }
                        }
                    }
                }

                function player2() {
                    // Attack hits!
                    let items = [];
                    UserM.findById(duelplayer.playerid, function (err, user) {
                        items = items.concat(user.inventory)
                    });
                    if (items.includes("[ 🌀 - Mana ]")) {
                        // Remove 1 Mana
                        var index = items.indexOf("[ 🌀 - Mana ]");
                        if (index > -1) {
                            items.splice(index, 1);
                        }
                        let damage = Math.floor(Math.random() * 80) + 25
                        duelplayer.opponenthealth -= damage;
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                title: item,
                                description: `🔥🌀 ${duelplayer.player}'s attack hit for ${damage} damage!`,
                                fields: [{
                                        name: `${duelplayer.opponent}'s health:`,
                                        value: `${duelplayer.opponenthealth}`
                                    },
                                    {
                                        name: `${duelplayer.player}'s health:`,
                                        value: `${duelplayer.playerhealth}`
                                    }
                                ]
                            }
                        });
                        UserM.findById(duelplayer.playerid, function (err, user) {
                            user.xp += 800;
                            user.save();
                        });
                        duelplayer.battleStarted = true;

                        if (duelplayer.opponenthealth <= 0) {
                            if (items.includes("[ ❤️ - Heart ]")) {
                                // Remove 1 Mana
                                var index = items.indexOf("[ ❤️ - Heart ]");
                                if (index > -1) {
                                    items.splice(index, 1);
                                }
                                duelplayer.opponenthealth = 100;

                            } else {
                                alive == false;
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `💀 ${duelplayer.opponent} died! 💀`
                                    }
                                });
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `✨ ${duelplayer.player} IS VICTORIOUS! ✨`
                                    }
                                });
                                UserM.findById(duelplayer.playerid, function (err, user) {
                                    user.xp += 5000;
                                    user.zcoins += 2500;
                                    user.save();
                                });
                                duelplayer = {
                                    opponent: [],
                                    player: [],
                                    battleStarted: false,
                                    opponentid: '',
                                    playerid: '',
                                    playerhealth: 100,
                                    opponenthealth: 100,
                                    player1: false,
                                    player2: false
                                }

                            }
                        }
                    } else {
                        let damage = Math.floor(Math.random() * 25)
                        duelplayer.opponenthealth -= damage;
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                title: item,
                                description: `🔥 ${duelplayer.player}'s attack hit for ${damage} damage!`,
                                fields: [{
                                        name: `${duelplayer.opponent}'s health:`,
                                        value: `${duelplayer.opponenthealth}`
                                    },
                                    {
                                        name: `${duelplayer.player}'s health:`,
                                        value: `${duelplayer.playerhealth}`
                                    }
                                ]
                            }
                        });
                        UserM.findById(duelplayer.playerid, function (err, user) {
                            user.xp += 500;
                            user.save();
                        });
                        duelplayer.battleStarted = true;

                        if (duelplayer.opponenthealth <= 0) {
                            if (items.includes("[ ❤️ - Heart ]")) {
                                // Remove 1 Mana
                                var index = items.indexOf("[ ❤️ - Heart ]");
                                if (index > -1) {
                                    items.splice(index, 1);
                                }
                                duelplayer.opponenthealth = 100;

                            } else {
                                alive == false;
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `💀 ${duelplayer.opponent} died! 💀`
                                    }
                                });
                                message.channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: item,
                                        description: `✨ ${duelplayer.player} IS VICTORIOUS! ✨`
                                    }
                                });
                                UserM.findById(duelplayer.playerid, function (err, user) {
                                    user.xp += 5000;
                                    user.zcoins += 2500;
                                    user.save();
                                });
                                duelplayer = {
                                    opponent: [],
                                    player: [],
                                    battleStarted: false,
                                    opponentid: '',
                                    playerid: '',
                                    playerhealth: 100,
                                    opponenthealth: 100,
                                    player1: false,
                                    player2: false
                                }

                            }
                        }
                    }
                }
            }
        }
        if (duelplayer.battleStarted == true) {
            battle();
        } else {
            message.channel.send({
                embed: {
                    color: 3447003,
                    title: item,
                    description: `You must be in a battle to use this command`
                }
            });
        }

    } else if (command === "forbes") {
        // No lag
        var edit = await message.channel.send("Browsing Forbes...");

        // Sort
        var sorted = sortProperties(config.userprofiles).reverse();

        // Default to 100
        var top = parseInt(args[0]) || 100;

        // Setup embed
        let embed = new Discord.RichEmbed()
            .setTitle("Forbes richest " + top)
            .setAuthor(client.user.username + " - FORBES", client.user.avatarURL)
            .setColor(15844367);

        // Add fields
        var counter = 1;
        for (var usr in sorted) {
            var user = sorted[counter - 1];
            var profile;
            profile = client.users.get(user[0])

            if (profile) {
                if (counter <= top) {
                    embed.addField(
                        counter +
                        ". " +
                        profile.username +
                        ", Zcoins: " +
                        user[1].zcoins,
                        "Level " + user[1].level
                    );
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