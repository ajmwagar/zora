const Discord = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const Path = require('path')

const {
    createCanvas,
    loadImage
} = require('canvas')
const canvas = createCanvas(1350, 768)
const ctx = canvas.getContext('2d')
const config = require("../config.json");

const talkedRecently = new Set();

var shopItems = [{
        Name: "Heart",
        Description: "Adds a ❤️ to your inventory, can be used in battles",
        Price: 500,
        ID: 0,
        Icon: "❤️"
    },
    {
        Name: "Mana",
        Description: "Adds a 🌀 to your inventory, increases the chance to win battles",
        Price: 1000,
        ID: 1,
        Icon: "🌀"
    }
];

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
    opponentid: "",
    playerid: "",
    playerhealth: 100,
    opponenthealth: 100,
    player1: false,
    player2: false
};

var alive = true;
var timeout;

async function bot(
    client,
    message,
    command,
    args,
    cuser,
    cserver,
    UserM,
    ServerM
) {
    if (command === "profile") {

        // Load background
        loadImage('./src/images/ProfileBG.png').then(async function (image) {

            // Draw background
            ctx.drawImage(image, 0, 0, 1350, 768)

            // User Name
            ctx.font = '70px Impact'
            ctx.fillStyle = '#262626';
            ctx.fillText(`${message.member.user.username}`, 40, 650)

            // Stats
            ctx.font = '40px Impact'
            ctx.fillStyle = '#262626';
            ctx.fillText(`XP:   ${cuser.xp} / ${Math.round(Math.pow(100, cuser.level / 10 + 1))}`, 580, 150)

            ctx.font = '40px Impact'
            ctx.fillStyle = '#262626';
            ctx.fillText(`ZCoins:   ${cuser.zcoins}`, 580, 200);

            var userInventory = cuser.inventory;

            var itemtext = []
            userInventory.forEach((item) => {
                let quantity = 1;
                if (typeof itemtext[item.ID] === 'undefined') {
                    itemtext[item.ID] = `${item.Name} - x${quantity}`;
                } else {
                    quantity++;
                    itemtext[item.ID] = `${item.Name} - x${quantity}`;
                }
            })

            itemtext = itemtext.slice(0, 3);

            ctx.font = '40px Impact'
            ctx.fillStyle = '#262626';
            ctx.fillText(`Inventory:   `, 580, 250);

            ctx.font = '40px Impact'
            ctx.fillStyle = '#ff4e00';
            ctx.fillText(`\n${itemtext.join("\n")}`, 580, 250);

            // User Level and VIP Status
            ctx.font = '40px Impact'
            ctx.fillStyle = '#ff4e00';
            if (cuser.VIP === true) {
                ctx.fillText(`Level: ${cuser.level} | VIP`, 40, 700)
            } else {
                ctx.fillText(`Level: ${cuser.level}`, 40, 700)
            }

            ctx.font = '30px Impact'
            ctx.fillStyle = '#262626';
            ctx.fillText(`Visit our website: https://zora.netlify.com`, 700, 740)

            // Load avatar
            let tempurl = message.member.user.avatarURL;
            tempurl = tempurl.replace('?size=2048', '')
            await loadImage(tempurl).then(async function (image) {
                // Draw Avatar
                ctx.drawImage(image, 84, 47, 398, 398)
            });

            // Asynchronous PNG output to discord
            canvas.toBuffer(async function (err, buf) {
                if (err) throw err; // encoding failed
                await message.channel.send(`${message.author}`, {
                    file: buf
                });
            })
        })

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
                        .addField("💰 Current Balance 💰", `${cuser.zcoins}`, true);
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
                            `⭐[VIP] Gave ${
                message.member.user.username
              } 5000 ZCoins! [VIP]⭐`
                        )
                        .addField("💰 Current Balance 💰", `${cuser.zcoins}`, true);
                    message.channel.send({
                        embed
                    });
                });
            }
            // Adds the user to the set so that they can't redeem daily for 24 hours
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                // Removes the user from the set after 24 hours
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
        var itemNames = [];
        shopItems.forEach(function (item) {
            itemNames.push(item);
        });
        const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setTitle(`🛒 Welcome ${message.member.user.username} to the shop 🛒`)
            .setDescription(
                `We have wares if you got coin! ZCoin to be precise! Type ${
          cserver.prefix
        }buy <item>`
            )
            .addField("Current Balance:", `${cuser.zcoins}`, true);
        message.channel
            .send({
                embed
            })
            .then(() => {
                itemNames.forEach(function (item) {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: item.Name,
                            description: item.Description,
                            fields: [{
                                name: "Price:",
                                value: `${item.Price} ZCoins 💰`
                            }]
                        }
                    });
                });
            });
    } else if (command === "buy") {
        var item = args[0];
        item = item.charAt(0).toUpperCase() + item.substr(1);
        if (shopItems.some(function (elem) {
                return elem.Name == item
            })) {
            var citem;
            citem = shopItems[shopItems.findIndex(elem => {
                return elem.Name == item
            })];
            if (cuser.zcoins >= citem.Price) {
                UserM.findById(message.author.id, function (err, user) {
                    user.zcoins -= citem.Price;
                    user.inventory.push(citem);
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
                opponentid: "",
                playerid: "",
                playerhealth: 100,
                opponenthealth: 100,
                player1: false,
                player2: false
            };
            message.channel.send({
                embed: {
                    color: 3447003,
                    title: item,
                    description: `⛔ ${
            message.author
          } Battle has been canceled due to inactivity!`
                }
            });
        }
        duelplayer.battleStarted = false;
        if (duelplayer.player1 == false) {
            duelplayer.player1 = true;
            alive == true;
            duelplayer.player.push(message.member.user.username);
            duelplayer.playerid = message.member.user.id;
            timeout = setTimeout(battleTimeout, 30000);
            const embed = new Discord.RichEmbed()
                .setTitle("⚔️ A CHALLENGER HAS ARRIVED! ⚔️")
                .setAuthor(client.user.username, client.user.avatarURL)
                .setColor("#ff0000")
                .setDescription(
                    `Type ${cserver.prefix}duel to join the battle! Ending in 30 seconds`
                )
                .setFooter("DUEL", client.user.avatarURL)
                .setThumbnail(message.member.user.avatarURL)
                .setTimestamp();
            message.channel.send({
                embed
            });
        } else {
            if (duelplayer.opponent.length == 0) {
                if (message.member.user.id != duelplayer.playerid) {
                    duelplayer.opponent.push(message.member.user.username);
                    duelplayer.opponentid = message.member.user.id;
                    clearTimeout(timeout);
                    const embed = new Discord.RichEmbed()
                        .setTitle(
                            `⚔️ ${message.member.user.username} HAS JOINED THE FIGHT! ⚔️`
                        )
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .setColor("#ff0000")
                        .setDescription(`Battle will start in 5 seconds!`)
                        .setFooter("DUEL", client.user.avatarURL)
                        .setThumbnail(message.member.user.avatarURL)
                        .setTimestamp();
                    message.channel.send({
                        embed
                    });
                    setTimeout(startBattle, 5000);
                } else {
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: item,
                            description: `⛔ ${
                message.author
              } you can't fight yourself! stay positive!`
                        }
                    });
                }
            } else {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: item,
                        description: `⛔ ${
              message.author
            } someone has already joined this duel!`
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
                .setDescription(`Type ${cserver.prefix}next to advance the battle!`)
                .setFooter("DUEL", client.user.avatarURL)
                .setTimestamp();
            await message.channel.send({
                embed
            });
        }
    } else if (command === "next") {

        /**
         * * This command basically starts the main
         * * game loop, battleTimout() is for ending and resetting the duel
         * * battle() executes every turn
         */

        function battleTimeout() {
            duelplayer = {
                opponent: [],
                player: [],
                battleStarted: false,
                opponentid: "",
                playerid: "",
                playerhealth: 100,
                opponenthealth: 100,
                player1: false,
                player2: false
            };
            message.channel.send({
                embed: {
                    color: 3447003,
                    title: item,
                    description: `⛔ ${
            message.author
          } Battle has been canceled due to inactivity!`
                }
            });
        }

        async function battle(items1, items2) {

            if (duelplayer.playerhealth <= 0 || duelplayer.opponenthealth <= 0) {
                duelplayer.battleStarted = false;
            }
            if (duelplayer.battleStarted == true) {
                if (Math.random() < 0.5) {
                    player1(items1);
                } else {
                    player2(items2);
                }

                async function player1(items) {
                    // Attack hits!
                    /*
                        if (items.some(function (elem) {
                                if (elem.Name == "Mana") {
                                    return true;
                                } else {
                                    return false;
                                }
                            })) {
                            // Remove 1 Mana
                            var index = items.findIndex((elem) => {
                                if (elem.Name == "Mana") {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                            if (index > -1) {
                                UserM.findById(duelplayer.opponentid, {
                                    $arrayElemAt: ["inventory", index]
                                }, function (err, user) {

                                    user.save();
                                });
                            }
                            let damage = Math.floor(Math.random() * 80) + 25;
                            duelplayer.playerhealth -= damage;
                            message.channel.send({
                                embed: {
                                    color: 3447003,
                                    title: item,
                                    description: `🔥🌀 ${
                      duelplayer.opponent
                    }'s attack hit for ${damage} damage!`,
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
                            UserM.findById(duelplayer.opponentid, {
                                $arrayElemAt: ["inventory", index]
                            }, function (err, user) {
                                user.xp += 800;
                                user.save();
                            });
                            duelplayer.battleStarted = true;

                            if (duelplayer.playerhealth <= 0) {
                                if (items.some(function (elem) {
                                        if (elem.Name == "Heart") {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    })) {
                                    // Remove 1 Heart
                                    var index = items.findIndex((elem) => {
                                        if (elem.Name == "Heart") {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    });
                                    if (index > -1) {
                                        UserM.findById(duelplayer.opponentid, {
                                            $arrayElemAt: ["inventory", index]
                                        }, function (err, user) {

                                            user.save();
                                        });
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
                                    clearTimeout(battleTimeout);
                                    UserM.findById(duelplayer.opponentid, {
                                        $arrayElemAt: ["inventory", index]
                                    }, function (err, user) {
                                        user.xp += 5000;
                                        user.zcoins += 2500;
                                        user.save();
                                    });
                                    duelplayer = {
                                        opponent: [],
                                        player: [],
                                        battleStarted: false,
                                        opponentid: "",
                                        playerid: "",
                                        playerhealth: 100,
                                        opponenthealth: 100,
                                        player1: false,
                                        player2: false
                                    };
                                }
                            }
                        } else {*/
                    let damage = Math.floor(Math.random() * 25);
                    duelplayer.playerhealth -= damage;
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: item,
                            description: `🔥 ${
                  duelplayer.opponent
                }'s attack hit for ${damage} damage!`,
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
                        /*
                        if (items.some(function (elem) {
                                if (elem.Name == "Heart") {
                                    return true;
                                } else {
                                    return false;
                                }
                            })) {
                            // Remove 1 Heart
                            var index = items.findIndex((elem) => {
                                if (elem.Name == "Heart") {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                            if (index > -1) {
                                UserM.findById(duelplayer.opponentid, {
                                    $arrayElemAt: ["inventory", index]
                                }, function (err, user) {

                                    user.save();
                                });
                            }
                            duelplayer.playerhealth = 100;
                        } else {*/
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
                        clearTimeout(battleTimeout);
                        UserM.findById(duelplayer.opponentid, function (err, user) {
                            user.xp += 5000;
                            user.zcoins += 2500;
                            return user.save();
                        });
                        duelplayer = {
                            opponent: [],
                            player: [],
                            battleStarted: false,
                            opponentid: "",
                            playerid: "",
                            playerhealth: 100,
                            opponenthealth: 100,
                            player1: false,
                            player2: false
                        };
                    }
                }
                /*
                    }
                }
                */
                async function player2(items) {
                    // Attack hits!
                    /*
                    if (items.some(function (elem) {
                            if (elem.Name == "Mana") {
                                return true;
                            } else {
                                return false;
                            }
                        })) {
                        // Remove 1 Mana
                        var index = items.findIndex((elem) => {
                            if (elem.Name == "Mana") {
                                return true;
                            } else {
                                return false;
                            }
                        });
                        if (index > -1) {
                            UserM.findById(message.author.id, function (err, user) {

                                return user.save();
                            });
                        }
                        let damage = Math.floor(Math.random() * 80) + 25;
                        duelplayer.opponenthealth -= damage;
                        message.channel.send({
                            embed: {
                                color: 3447003,
                                title: item,
                                description: `🔥🌀 ${
                      duelplayer.player
                    }'s attack hit for ${damage} damage!`,
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
                            return user.save();
                        });
                        duelplayer.battleStarted = true;

                        if (duelplayer.opponenthealth <= 0) {
                            if (items.some(function (elem) {
                                    if (elem.Name == "Heart") {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                })) {
                                // Remove 1 Heart
                                var index = items.findIndex((elem) => {
                                    if (elem.Name == "Heart") {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                                if (index > -1) {
                                    UserM.findById(duelplayer.playerid, function (err, user) {

                                        user.save();
                                    });
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
                                clearTimeout(battleTimeout);
                                UserM.findById(duelplayer.playerid, function (err, user) {
                                    user.xp += 5000;
                                    user.zcoins += 2500;
                                    return user.save();
                                });
                                duelplayer = {
                                    opponent: [],
                                    player: [],
                                    battleStarted: false,
                                    opponentid: "",
                                    playerid: "",
                                    playerhealth: 100,
                                    opponenthealth: 100,
                                    player1: false,
                                    player2: false
                                };
                            }
                        }
                    } else {*/
                    let damage = Math.floor(Math.random() * 25);
                    duelplayer.opponenthealth -= damage;
                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: item,
                            description: `🔥 ${
                  duelplayer.player
                }'s attack hit for ${damage} damage!`,
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
                        return user.save();
                    });
                    duelplayer.battleStarted = true;

                    if (duelplayer.opponenthealth <= 0) {
                        /*
                        if (items.some(function (elem) {
                                if (elem.Name == "Heart") {
                                    return true;
                                } else {
                                    return false;
                                }
                            })) {
                            // Remove 1 Heart
                            var index = items.findIndex((elem) => {
                                if (elem.Name == "Heart") {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                            if (index > -1) {
                                UserM.findById(duelplayer.playerid, function (err, user) {

                                    return user.save();
                                });
                            }
                            duelplayer.opponenthealth = 100;
                        } else {*/
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
                        clearTimeout(battleTimeout);
                        UserM.findById(duelplayer.playerid, function (err, user) {
                            user.xp += 5000;
                            user.zcoins += 2500;
                            return user.save();
                        });
                        duelplayer = {
                            opponent: [],
                            player: [],
                            battleStarted: false,
                            opponentid: "",
                            playerid: "",
                            playerhealth: 100,
                            opponenthealth: 100,
                            player1: false,
                            player2: false
                        };
                    }
                }
            }
        }
        /*
        }
        }
        */
        if (duelplayer.battleStarted == true) {
            var items1 = [];
            var items2 = [];
            await UserM.findById(duelplayer.opponentid, function (err, user) {
                return items1 = items1.concat(user.inventory);
            });
            await UserM.findById(duelplayer.playerid, function (err, user) {
                return items2 = items2.concat(user.inventory);
            });
            while (duelplayer.battleStarted == true) {
                battle(items1, items2);
            }
        } else {
            message.channel.send({
                embed: {
                    color: 3447003,
                    title: item,
                    description: `⛔ You must be in a battle to use this command`
                }
            });
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