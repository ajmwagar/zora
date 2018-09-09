const Discord = require("discord.js");
const axios = require('axios');

const config = require("../config.json");

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
  if (command === "weather") {

    var city = args[0];

    if (!city) {
      return message.reply("Please provide a valid city");
    } else {
      const m = await message.channel.send("Getting Weather Data...");
      const weather = axios.create({
        // Get data from weather API
        baseURL: "http://api.apixu.com/v1/forecast.json?key=5d0a7d3aa80e4d5b843181446181308&q=" + city.trim(),
        headers: {
          Accept: "application/json"
        }
      });
      weather.get("/").then(res => {
        message.channel.send({
          embed: {
            color: 3447003,
            author: {
              name: "Current Weather Forecast",
              icon_url: "https:" + res.data.current.condition.icon
            },
            fields: [{
                name: "Visible Conditions:",
                value: res.data.current.condition.text.toString()
              },
              {
                name: "Temperature:",
                value: res.data.current.temp_f.toString()
              },
              {
                name: "Humidity:",
                value: res.data.current.humidity.toString()
              },
              {
                name: "Wind Speed (MPH):",
                value: res.data.current.wind_mph.toString() + " | " + res.data.current.wind_dir.toString()
              },
              {
                name: "🌡️ High Temperture for today:",
                value: res.data.forecast.forecastday[0].day.maxtemp_f.toString()
              },
              {
                name: "❄️ Low Temperture for today:",
                value: res.data.forecast.forecastday[0].day.mintemp_f.toString()
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

module.exports = {
  bot
};