const Discord = require("discord.js");
const fs = require('fs');
const config = require("./config.json");
const axios = require('axios');

function getMemes(client, message){
  config.reddit.subreddits.forEach((sub) => {
    // Get the top posts based on config variable
    const reddit = axios.create( {
      baseURL: 'https://www.reddit.com/r/' + sub + '/hot/.json?t=hour',
      headers: {
        Accept: "application/json"
      }
    } );
    // respond
    reddit.get("/").then(res => {
      // console.log(res.data.data.children);
      res.data.data.children.forEach((post) => {
        if (post.data.post_hint == "image"){
          const embed = new Discord.RichEmbed()
            .setTitle(post.data.title)
            .setAuthor(config.name + " - Source: Reddit", client.user.avatarURL)
            .setColor(0xff5323)
            .setDescription("From: " + post.data.subreddit_name_prefixed)
            .setImage(post.data.url)
            .setThumbnail("https://i.imgur.com/XXMF5Ee.png")
            .setTimestamp()
            .setURL("https://reddit.com" + post.data.permalink)
          message.channel.send({embed});
        }
      });
    })
  })
}

async function bot(client, message, command, args){
  if (command === "subs"){
    var embed = new Discord.RichEmbed()
      .setTitle("Subrcribed Subreddits")
      .setAuthor(config.name, client.user.avatarURL)
      .setColor(0xff5323)
      .setDescription("Currently Subrcribed to " + config.reddit.subreddits.length + " subreddits.")
      .setThumbnail("https://i.imgur.com/XXMF5Ee.png")
    message.channel.send({embed})

    config.reddit.subreddits.forEach((sub) => {
      var embed = new Discord.RichEmbed()
        .setTitle(sub)
        .setAuthor(config.name, client.user.avatarURL)
        .setColor(0xff5323)
        .setDescription(sub)
        .setThumbnail("https://i.imgur.com/XXMF5Ee.png")
      message.channel.send({embed})

    })

  }
  else if (command === "addsub"){
    var sub = args[0].trim()
    if (sub.includes('r/')){
      sub = sub.split('r/')[1].trim();
    }

    if (sub){

      config.reddit.subreddits.push(sub);

      fs.writeFile("./config.json", JSON.stringify(config), (err) => {})

      return message.reply("Added /r/" + sub);
    }
    else {

      return message.reply("No Subreddit provided.");
    }

  }

  else if (command === "removesub"){
    var sub = args[0].trim()
    if (sub.includes('r/')){
      sub = sub.split('r/')[1].trim();
    }

    if (sub){
      // Get index of sub
      var index = config.reddit.subreddits.indexOf(sub)

      // Check if sub is in list
      if (index > -1){
        // Remove sub 
        config.reddit.subreddits.splice(index, 1);

        fs.writeFile("config.json", JSON.stringify(config), (err) => {})

        return message.reply("Removed r/" + sub);
      }
      else {
        return message.reply(sub + " not found.");
      }

    }
    else {
      return message.reply("No Subreddit provided.");

    }
  }

  else if (command === "setmemechannel"){
    if(!message.member.roles.some(r=>["Owner", "Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    let channel = args[0].trim();

    if (channel){

      config.reddit.channel = channel;

      fs.writeFile("config.json", JSON.stringify(config), (err) => {})

      return message.reply("Set " + channel + " as meme channel");
    }
    else {
      return message.reply("No Subreddit provided.");

    }

  }

  else if (command === "setmemeinterval"){
    if(!message.member.roles.some(r=>["Owner", "Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");

    var interval;
    try {
      interval = parseInt(args[0].trim())
    }
    catch(e){
      if (e)
        return message.reply("Please provid a valid interval (a number)");
    }
    finally{

      if (interval){


        config.reddit.interval = interval;

        fs.writeFile("config.json", JSON.stringify(config), (err) => { /*message.channel.send("Error: " + err)*/})

        clearInterval(memeInterval);

        memeInterval = setInterval(getMemes, config.reddit.interval * 1000 * 60 * 60);

        return message.reply("Updated interval to: " + interval + " hour(s)");
      }
      else {
        return message.reply("No interval provided.");
      }

    }
  }
  else if (command === "memes"){
    message.reply("Enjoy ;)");
    getMemes(client, message);
  }
}

module.exports = {bot};
