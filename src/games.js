const Discord = require("discord.js");

const config = require("../config.json");

// TRN-Api-Key: e4499a16-fa6a-4ba7-8c87-590c622475ca
const axios = require('axios');

const pubg = axios.create({
  baseURL: 'api.pubgtracker.com/v2/',
  timeout: 1000,
  headers: {
    'TRN-Api-Key': 'e4499a16-fa6a-4ba7-8c87-590c622475ca'
  }
});
const fortnite = axios.create({
  baseURL: 'api.fortnitetracker.com/v1/',
  timeout: 1000,
  headers: {
    'TRN-Api-Key': 'e4499a16-fa6a-4ba7-8c87-590c622475ca'
  }
});


async function bot(client, message, command, args, cuser, cserver) {
  if (command === "fortnite") {
    if (args) {
      var input = args;
      var platform, profile;

      platform = input.shift().trim();
      profile = input[1].trim();

      fortnite.get(`/profile/${platform}/${profile}`).then((res) => {
        console.log(res);

        // TODO Implement formatting
        message.channel.send(res.data);

      });

    }
  } else if (command === "pubg") {
    if (args) {
      var input = args;
      var platform, profile;

      platform = input.shift().trim();
      profile = input[1].trim();

      pubg.get(`/profile/${platform}/${profile}`).then((res) => {
        console.log(res);

        // TODO Implement formatting
        message.channel.send(res.data);

      });

    }
  }
}

module.exports = {
  bot
};