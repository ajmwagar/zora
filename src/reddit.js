const Discord = require("discord.js");
const fs = require('fs');
const config = require("../config.json");
const axios = require('axios');

function getMemes(client, message) {
  config.serverconfigs[message.guild.id].reddit.subreddits.forEach((sub) => {
    // Get the top posts based on config variable
    const reddit = axios.create({
      baseURL: 'https://www.reddit.com/r/' + sub + '/hot/.json?t=hour',
      headers: {
        Accept: "application/json"
      }
    });
    // respond
    reddit.get("/").then(res => {
      // console.log(res.data.data.children);
      var t
      for (i = 0; i <= (config.serverconfigs[message.guild.id].reddit.posts + 1); i++) {
        if (i > res.data.data.children) {
          t = 0
        } else {
          t = i;
        }
        post = res.data.data.children[i]
        if (post.data.post_hint == "image") {
          const embed = new Discord.RichEmbed()
            .setTitle(post.data.title)
            .setAuthor(client.user.username + " - Source: Reddit", client.user.avatarURL)
            .setColor(0xff5323)
            .setDescription("From: " + post.data.subreddit_name_prefixed)
            .setImage(post.data.url)
            .setThumbnail("https://i.imgur.com/XXMF5Ee.png")
            .setTimestamp()
            .setURL("https://reddit.com" + post.data.permalink)
          message.channel.send({
            embed
          });
        }
      }
    });
  })
}

async function bot(client, message, command, args) {
  if (command === "subs") {
    var embed = new Discord.RichEmbed()
      .setTitle("Subrcribed Subreddits")
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor(0xff5323)
      .setDescription("Currently Subrcribed to " + config.serverconfigs[message.guild.id].reddit.subreddits.length + " subreddits.")
    message.channel.send({
      embed
    })

    config.serverconfigs[message.guild.id].reddit.subreddits.forEach((sub) => {
      var embed = new Discord.RichEmbed()
        .setTitle('r/' + sub)
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor(0xff5323)
      message.channel.send({
        embed
      })

    })

  } else if (command === "addsub") {
    var sub = args[0].trim()
    if (sub.includes('r/')) {
      sub = sub.split('r/')[1].trim();
    }

    if (sub) {

      config.serverconfigs[message.guild.id].reddit.subreddits.push(sub);

      fs.writeFile("./config.json", JSON.stringify(config), (err) => {})

      return message.reply("Added /r/" + sub);
    } else {

      return message.reply("No Subreddit provided.");
    }

  } else if (command === "removesub") {
    var sub = args[0].trim()
    if (sub.includes('r/')) {
      sub = sub.split('r/')[1].trim();
    }

    if (sub) {
      // Get index of sub
      var index = config.serverconfigs[message.guild.id].reddit.subreddits.indexOf(sub)

      // Check if sub is in list
      if (index > -1) {
        // Remove sub 
        config.serverconfigs[message.guild.id].reddit.subreddits.splice(index, 1);

        fs.writeFile("config.json", JSON.stringify(config), (err) => {})

        return message.reply("Removed r/" + sub);
      } else {
        return message.reply(sub + " not found.");
      }

    } else {
      return message.reply("No Subreddit provided.");

    }
  } else if (command === "setmemechannel") {
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    let channel = args[0].trim();

    if (channel) {

      config.serverconfigs[message.guild.id].reddit.channel = channel;

      fs.writeFile("config.json", JSON.stringify(config), (err) => {})

      return message.reply("Set " + channel + " as meme channel");
    } else {
      return message.reply("No Subreddit provided.");

    }

  } else if (command === "setmemeinterval") {
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    var interval;
    try {
      interval = parseInt(args[0].trim())
    } catch (e) {
      if (e)
        return message.reply("Please provid a valid interval (a number)");
    } finally {

      if (interval) {


        config.serverconfigs[message.guild.id].reddit.interval = interval;

        fs.writeFile("config.json", JSON.stringify(config), (err) => { /*message.channel.send("Error: " + err)*/ })

        clearInterval(memeInterval);

        memeInterval = setInterval(getMemes, config.serverconfigs[message.guild.id].reddit.interval * 1000 * 60 * 60);

        return message.reply("Updated interval to: " + interval + " hour(s)");
      } else {
        return message.reply("No interval provided.");
      }

    }
  } else if (command === "memes") {
    message.reply("Showing the hot " + config.serverconfigs[message.guild.id].reddit.posts + " posts, enjoy! ;)");
    getMemes(client, message);
  } else if (command === "setposts") {
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    var posts;
    try {
      posts = parseInt(args[0].trim())
    } catch (e) {
      if (e)
        return message.reply("Please provid a valid number of posts");
    } finally {

      if (posts) {


        config.serverconfigs[message.guild.id].reddit.posts = posts;

        fs.writeFile("config.json", JSON.stringify(config), (err) => {
          // message.channel.send("Error: " + err)
        })
        return message.reply("Updated posts to: " + posts + " per subreddit");
      } else {
        return message.reply("No number provided.");
      }

    }
  }
}

module.exports = {
  bot
};
