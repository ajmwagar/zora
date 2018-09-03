//
//    Please note I have no idea what I am doing and have never used node.js before.
//
const Discord = require("discord.js");
const axios = require('axios');

const config = require("./config.json");

async function bot(client, message, command, args) {
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
        
        const initDate = Date().getTime;
        var initDayLocal;
        weather.get("/").then(res => {initDayLocal = res.data.current.last_updated.toString().substr(0,10);});
        while(initDate.getTime - Date.getTime < 86400000 && weather.get("/").then(res => res.data.current.last_updated.toString().substr(0,10) === initDayLocal)) {
            //Allow a maximum of 24 hours in case something breaks, and also try to end at midnight local time
            weather.get("/").then(res => {
                m.edit({ //Edit the "Getting Weather Data..." message
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
            await new Promise(resolve => setTimeout(resolve, 60000)); //Wait 1 minute between updates- if this causes too much lag the time can be increased
        }
    }
  }
}

module.exports = {
  bot
};
