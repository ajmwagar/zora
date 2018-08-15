const Discord = require("discord.js");
const axios = require('axios');
const querystring = require("querystring");

const config = require("./config.json");

async function bot(client, message, command, args) {
    if (command === "yoda") {

        var nonYoda = args.join(" ");
        var yodaObj = {
            text: nonYoda
        }
        if (!nonYoda) {
            return message.reply("Words, you must provide!");
        } else {
            var YodaEncode = querystring.stringify(yodaObj);
            const m = await message.channel.send("Translating, I am!");
            const yoda = axios.create({
                // Get data from yoda API
                baseURL: "http://yoda-api.appspot.com/api/v1/yodish?" + YodaEncode,
                headers: {
                    Accept: "application/json"
                }
            });
            yoda.get("").then(res => {
                m.edit(res.data.yodish)
            }).catch(error => {
                console.log(error.message);
            })
        }
    }
}

module.exports = {
    bot
};