// Load up the discord.js library
const Discord = require("discord.js");
const getJSON = require('get-json');
// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

const axios = require('axios');


let queue = {}

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`${client.guilds.size} servers | ${config.prefix}help`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`${client.guilds.size} servers | ${config.prefix}help`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`${client.guilds.size} | ${config.prefix}help`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if (message.content.indexOf(config.prefix) !== 0) return;

  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Admin

  if (command === "help") {
    // Help message
    // Lists of current commands
    let help = "\n\nHi there, I'm " + config.name + ".\n\nMy commands are:\n- `" + config.prefix + "help`: show this help menu\n- `" + config.prefix + "ban <user>`: ban a user (admins only)\n- `" + config.prefix + "kick <user>`: kick a user (admins and mods only)\n- `" + config.prefix + "purge <number of messages>`: purge a channel\n- `" + config.prefix + "ping`: Pong?\n- `" + config.prefix + "say <message>`: say a message\n- `" + config.prefix + "joke`: Tell a joke\n- `" + config.prefix + "weather <city>`: Get the weather for a city\n\nHope I could help!\n\nKeep on fragging!"

    // Reply to message
    message.reply(help);
  } else if (command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  } else if (command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o => {});
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  } else if (command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if (!message.member.roles.some(r => ["Owner", "Administrator", "Moderator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if (!member)
      return message.reply("Please mention a valid member of this server");
    if (!member.kickable)
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";

    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  } else if (command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if (!message.member.roles.some(r => ["Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if (!member)
      return message.reply("Please mention a valid member of this server");
    if (!member.bannable)
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";

    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  } else if (command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);

    // Ooooh nice, combined conditions. <3
    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({
      limit: deleteCount
    });
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }

  // Weather

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
        m.edit("**Current Weather:**\n  Conditions: " + res.data.current.condition.text + "\n  Temperature: " + res.data.current.temp_f + "\n  Humidity: " + res.data.current.humidity);
      })
    }
  }

  // Memes

  // TODO Add reddit implementation
  else if (command === "addSub") {
    let sub = args.slice(1).join(' ');
    if (sub) {
      return message.reply("Added " + sub);
    } else {

      return message.reply("No Subreddit provided.");
    }

  } else if (command === "removeSub") {
    let sub = args.slice(1).join(' ');
    if (sub) {
      return message.reply("Removed " + sub);
    } else {
      return message.reply("No Subreddit provided.");

    }
  } else if (command === "setMemeChannel") {

  } else if (command === "setMemeInterval") {

  }

  // Music

  // TODO https://stackoverflow.com/questions/35347054/how-to-create-youtube-search-through-api
  else if (command === "play") {
    // let song = args.slice(1).join(' ');

    // radio = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });

  } else if (command === "stop") {

  } else if (command === "skip") {

  }


  // Jokes

  // Tell a joke using icanhazdadjoke.com (random dad jokes)
  // Use axios to create an api
  else if (command === "joke") {
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




});

client.login(config.token);