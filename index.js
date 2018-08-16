// Load up the discord.js library
const Discord = require("discord.js");
const fs = require('fs');
// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.serverconfigs[message.guild.id].prefix contains the message prefix.

const axios = require('axios');

// Internal modules
const automod = require("./automod");
const admin = require('./admin');
const memes = require('./reddit');
const radio = require('./radio');
const weather = require('./weather');
const yoda = require('./yoda');
const overflow = require('./overflow');
const utility = require('./utility');



// var memeInterval = setInterval(getMemes, config.reddit.interval * 1000 * 60 * 60);

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`on ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`on ${client.guilds.size} servers`);

  var defaultConfig = {
    'name': config.name,
    'prefix': '.',
    'reddit': {
      'subreddits': [],
      'posts': 5,
      'channel': '',
      'interval': 1
    },
    'automod': {
      'bannedwords': []
    }
  }
  if (!config.serverconfigs.hasOwnProperty(guild.id)) config.serverconfigs[guild.id] = defaultConfig;

  fs.writeFileSync("./config.json", JSON.stringify(config));
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`on ${client.guilds.size}`);
});


client.on("message", async message => {
  if (message.guild.id) {

    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;


    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    // TODO Automod filter
    if (message.content.indexOf(config.serverconfigs[message.guild.id].prefix) !== 0) return automod.censor(message);

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.serverconfigs[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    // Admin

    admin.bot(client, message, command, args);

    // Weather 

    weather.bot(client, message, command, args);

    // Memes

    memes.bot(client, message, command, args);

    // Music

    radio.bot(client, message, command, args);

    // Yodaspeak

    yoda.bot(client, message, command, args);

    // Stack Overflow

    overflow.bot(client, message, command, args);

    // Utility

    utility.bot(client, message, command, args);


    // Jokes

    // Tell a joke using icanhazdadjoke.com (random dad jokes)
    // Use axios to create an api
    if (command === "joke") {
      // Tee it up
      const m = await message.channel.send("Let me think...");

      // Get the joke
      const jokeApi = axios.create({
        baseURL: "https://icanhazdadjoke.com",
        headers: {
          Accept: "application/json"
        }
      });

      // respond
      jokeApi.get("/").then(res => {
        m.edit(res.data.joke)
      })
    }



  } else {
    message.reply("Please use in a discord server. DM's are coming soon.");
  }
});

client.login(config.token);