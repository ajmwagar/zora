const Discord = require("discord.js");
const axios = require('axios');

const config = require("./config.json");

async function bot(client, message, command, args){
  if (command === "weather") {

    var city = args[0];

    if (!city) {
      return message.reply("Please provide a valid city");
    } else {
      const m = await message.channel.send("Getting Weather Data...");
      const weather = axios.create({
        baseURL: "http://api.apixu.com/v1/current.json?key=5d0a7d3aa80e4d5b843181446181308&q=" + city.trim(),
        headers: {
          Accept: "application/json"
        }
      });
      weather.get("/").then(res => {
        message.channel.send({embed: {
          color: 3447003,
          author: {
            name: "Weather",
            icon_url: res.data.current.condition.icon
          },
          title: "Current Conditions:",
          fields: [{
            name: "Temperature:",
            value: res.data.current.temp_f
          },
            {
              name: "Humidity",
              value: res.data.current.humidity
            }
          ],
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

module.exports = {bot};
