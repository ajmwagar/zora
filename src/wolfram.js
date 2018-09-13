const Discord = require("discord.js");
const axios = require('axios');
const querystring = require("querystring");

const config = require("../config.json");

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
  if (command === "wolfram") {

    var inputRaw = args.join(" ");
    var inputObj = {
      input: inputRaw
    }
    if (!inputRaw) {
      return message.reply("You must provide an input search!");
    } else {
      var InputEncode = querystring.stringify(inputObj);
      const m = await message.channel.send("Searching WolframAlpha!");
      const wolframAPI = axios.create({
        // Get data from wolfram API
        baseURL: "https://api.wolframalpha.com/v2/query?" + InputEncode + "&appid=" + config.wolfram + "&output=json",
        headers: {
          Accept: "application/json"
        }
      });
      wolframAPI.get("").then(res => {
        var embed = new Discord.RichEmbed()
          .setTitle(`Wolfram Alpha | STATUS: ${res.data.queryresult.success.toString()}`)
          .setThumbnail("https://i.imgur.com/EHDniJf.png")
          .setDescription("Your result is shown in the fields below:")
          .setAuthor(client.user.username + " - Wolfram", client.user.avatarURL)
          .setColor(15158332)

        if (!res.data.queryresult.success === true) {
          embed.setTitle(`Wolfram Alpha | STATUS: Error`)
          embed.setDescription(`Something went wrong! Please check to make sure you are entering a valid search!`);
        }

        for (var obj in res.data.queryresult.pods) {

          var pod = res.data.queryresult.pods[obj]

          var plaintexts = [];

          // If the response has a graph, show it!
          if (pod.title == 'Plotter' || pod.title == 'Result' || pod.title == 'Visual representation' || pod.title == 'Example plot') {
            var subpod = res.data.queryresult.pods[obj].subpods[0]
            if (subpod.img.src) {
              embed.setImage(subpod.img.src);
            }
          } else {
            for (var pod2 in pod.subpods) {
              var subpod = res.data.queryresult.pods[obj].subpods[pod2]
              if (subpod.plaintext && subpod.plaintext != '') {
                plaintexts.push(subpod.plaintext)
              }
            }
          }

          var valuetext = plaintexts.join(" ");

          if (pod.title && valuetext && res.data.queryresult.success && !res.data.queryresult.error) {
            embed.addField(pod.title, valuetext, false);
          }

        }
        m.edit(embed);
      }).catch(error => {
        console.log(error.message);
      })
    }
  }
}

module.exports = {
  bot
};