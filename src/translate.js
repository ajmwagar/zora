const Discord = require("discord.js");
const {
    Translate
} = require('@google-cloud/translate');

const config = require("../config.json");

const projectId = config.gcloudProjectID;
const translate = new Translate();

async function bot(client, message, command, args, cuser, cserver) {

    async function translateMessage(input, language, fromlang) {
        translate
            .translate(input, language)
            .then(results => {
                if (language == "en") {
                    message.channel.send(`**${message.author} \:flag_${fromlang}:==>\:flag_gb: Said:\n** ` + results[0]);
                } else {
                    message.channel.send(`**${message.author} \:flag_${fromlang}:==>\:flag_${language}: Said:\n** ` + results[0]);
                }
            })
            .catch(err => {
                message.channel.send(`Something went wrong when translating! Please make sure you format the command as follows:\n**${config.serverconfigs[message.guild.id].prefix}translate <language code> <text input>**`)
                console.error('ERROR:', err);
            });
        message.delete().catch(O_o => {});
    }

    if (command === "translate") {
        if (args && args.length > 0) {
            var input = args;
            var language = ""
            language = input.shift();
            language = language.trim();
            input = input.join(" ");
            translate
                .detect(input)
                .then(results => {
                    let detections = results[0];
                    detections = Array.isArray(detections) ? detections : [detections];
                    if (detections[0].language == "en") {
                        translateMessage(input, language, 'gb');
                    } else {
                        translateMessage(input, language, detections[0].language);
                    }
                })
                .catch(err => {
                    console.error('ERROR:', err);
                });
        } else {
            message.channel.send(`Something went wrong when translating! Please make sure you format the command as follows:\n**${cserver.prefix}translate <language code> <text input>**`)
        }
    }
}

module.exports = {
    bot
};