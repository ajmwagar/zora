const Discord = require("discord.js");

const config = require("../config.json");

// TRN-ApiKey: e4499a16-fa6a-4ba7-8c87-590c622475ca
const axios = require('axios');

const pubg = axios.create({
  baseURL: 'https://api.pubgtracker.com/v2/profile/pc/',
  timeout: 100000,
  headers: {
    'TRN-Api-Key': 'e4499a16-fa6a-4ba7-8c87-590c622475ca'
  }
});
const fortnite = axios.create({
  baseURL: 'https://api.fortnitetracker.com/v1/',
  timeout: 100000,
  headers: {
    'TRN-Api-Key': 'e4499a16-fa6a-4ba7-8c87-590c622475ca'
  }
});


async function bot(client, message, command, args, cuser, cserver) {
  if (command === "fortnite") {
    if (args) {
      var m = await message.channel.send("Watching replays...");

      var input = args;
      var platform, profile;

      platform = input[0].trim();
      profile = input[1].trim();

      fortnite.get(`/profile/${platform}/${profile}`).then((res) => {

        var embed = new Discord.RichEmbed()
          .setTitle(`Fortnite Stats | ${res.data.epicUserHandle}`)
          .setThumbnail("http://www.stickpng.com/assets/images/5b43b818e99939b4572e32ab.png")
          .setDescription("Platform: " + res.data.platformNameLong)
          .setAuthor(client.user.username + " - Stats", client.user.avatarURL)
          .setColor(15844367)

        for (var obj in res.data.lifeTimeStats) {
          var stat = res.data.lifeTimeStats[obj]

          embed.addField(stat.key, stat.value, true);

        }
        // TODO Implement formatting
        m.edit(embed);

      }).catch(error => {
        m.edit("Sorry! Something didn't work properly! Please try fixing any typos or use the " + cserver.prefix "bug command to report any more serious issues. Thank you for choosing ZoraBOT!")
      });


    } else {
      message.channel.send("Please provide both platform and username");
    }
  } else if (command === "pubg") {
    if (args.length > 1) {
      var m = await message.channel.send("Watching replays...");

      var input = args;
      var region, profile;

      region = input[0].trim();
      profile = input[1].trim();

      pubg.get(`/${profile}?region=${region}`).then((res) => {

        var embed = new Discord.RichEmbed()
          .setTitle(`PUBG Stats | ${res.data.epicUserHandle}`)
          .setDescription("Region: " + region)
          .setAuthor(client.user.username + " - Stats", client.user.avatarURL)
          .setColor(15844367)

        for (var obj in res.data.lifeTimeStats) {
          embed.addField(obj.key, obj.value, true);
        }

        // TODO Implement formatting
        m.edit(embed);

      }).catch(error => {
        m.edit("Sorry! Something didn't work properly! Please try fixing any typos or use the " + cserver.prefix "bug command to report any more serious issues. Thank you for choosing ZoraBOT!")
      });

    } else {
      message.channel.send("Please provide both platform and username");
    }
  }
}

module.exports = {
  bot
};