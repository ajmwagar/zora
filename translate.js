const Discord = require("discord.js");
const translate = require('translate');

const config = require("./config.json");

// Google translate API
translate.engine = 'google';
// We use the same API key that we used for youtube-search!
translate.key = config.youtubeKey;

async function bot(client, message, command, args) {
    if (command === "translate") {
        if (args) {
            var input = args;
            var language = ""
            language = input.shift();
            language = language.trim();
            input = input.join("");
            translate(input, language).then(output => {
                message.channel.send(`**${message.author} Said:\n** ` + output);
            }).catch(err => {
                message.channel.send(`Something went wrong when translating! Please make sure you format the command as follows:\n**${config.serverconfigs[message.guild.id].prefix}translate <language code> <text input>**`)
            });
            message.delete().catch(O_o => {});
        } else {
            message.channel.send(`Something went wrong when translating! Please make sure you format the command as follows:\n**${config.serverconfigs[message.guild.id].prefix}translate <language code> <text input>**`)
        }
    }
}

module.exports = {
    bot
};