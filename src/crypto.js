const Discord = require("discord.js");
const axios = require('axios');

const config = require("../config.json");

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
    if (command === "currency") {

        var coin = args[0].trim();
        var currency = args[1].trim();

        if (!coin || !currency) {
            return message.reply("Please provide a valid cryptocurrency/currency (example: BTC)");
        } else {
            const m = await message.channel.send("Getting Currency Prices...");
            const cryptoc = axios.create({
                // Get data from weather API
                baseURL: `https://min-api.cryptocompare.com/data/price?fsym=` + coin + `&tsyms=` + currency,
                headers: {
                    Accept: "application/json"
                }
            });
            cryptoc.get("").then(res => {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        author: {
                            name: `📡 The price of ${coin} in ${currency}:`,
                        },
                        description: `${currency}: ` + res.data[currency],
                        timestamp: new Date(),
                        footer: {
                            icon_url: client.user.avatarURL,
                            text: "© " + message.guild
                        }
                    }
                });
            })
        }
    }
}

module.exports = {
    bot
};