var start = Date.now();
// Load up the discord.js library
const Discord = require("discord.js");
const fs = require("fs");
// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `client.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

/*const DBL = require("dblapi.js");
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ3ODYxNjQ3MTY0MDA4MDM5NSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTM2MDM5MDMwfQ.MXCzqXorJBqGc-bkRxnyn_9bJcpKPZDZUvZLk6U1Dp4', client);

// Optional events
dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
  console.log(`Oops! ${e}`);
})*/

// Here we load the config.json file that contains our token and our prefix values.
const config = require("../config.json");
const bugs = require("../bugs.json");
// config.token contains the bot's token
// config.serverconfigs[message.guild.id].prefix contains the message prefix.

const axios = require("axios");
const moment = require("moment");
var Long = require("long");
const chalk = require('chalk');

// Internal modules
const automod = require("./automod");
const admin = require("./admin");
const memes = require("./reddit");
const radio = require("./radio");
const weather = require("./weather");
const yoda = require("./yoda");
const overflow = require("./overflow");
const utility = require("./utility");
const translate = require("./translate");
const crypto = require("./crypto");
const profile = require("./profile")
const modlog = require("./events/modlog");

// Default server configuration (also used with .clearcfg)
var defaultConfig = {
  name: config.name,
  prefix: ".",
  modlogChannel: "modlog",
  reddit: {
    subreddits: [],
    posts: 3,
    channel: "",
    interval: 1
  },
  automod: {
    bannedwords: []
  }
};

// Default user profile config
var defaultprofile = {
  level: 1,
  xp: 0,
  zcoins: 100,
  VIP: false
};

// var memeInterval = setInterval(getMemes, config.reddit.interval * 1000 * 60 * 60);

client.on("ready", () => {
  client.guilds.forEach(function (guild) {
    // Initialize User Profiles
    guild.members.forEach(function (member) {
      if (config.userprofiles && !config.userprofiles.hasOwnProperty(member.id)) {
        config.userprofiles[member.id] = defaultprofile;
      }
    });

    if (config.serverconfigs && !config.serverconfigs.hasOwnProperty(guild.id)) {
      config.serverconfigs[guild.id] = defaultConfig;
    }

    fs.writeFileSync("./config.json", JSON.stringify(config));

  });

  // This event will run if the bot starts, and logs in, successfully.
  console.log("Shard startup took: " + (new Date().getTime() - start) + "MS");
  if (client.shard) {
    console.log(chalk.bgGreen(
      "Shard #" +
      client.shard.id +
      " active with " +
      client.guilds.size +
      " guilds"
    ));
    client.user.setPresence({
      game: {
        name: "@Nitro help | Shard " +
          (client.shard.id + 1) +
          "/" +
          client.shard.count,
        type: 0
      }
    });
  } else {
    console.log(chalk.bgGreen(("Shard #0 active with " + client.guilds.size + " guilds")));
    client.user.setPresence({
      game: {
        name: "@Nitro help | " + client.guilds.size + " guilds",
        type: 0
      }
    });
  }
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`on ${client.guilds.size} servers`);
  fs.exists("../config.json", function (exists) {
    if (!exists) {
      var fileContent = {
        token: "",
        youtubeKey: "",
        serverconfigs: {},
        userprofiles: {}
      };
      var filepath = "../config.json";

      fs.writeFile(filepath, fileContent, err => {
        if (err) throw err;

        console.log("Configuration file generated at ../config.json");
      });
    }
  });
  fs.exists("bugs.json", function (exists) {
    if (!exists) {
      var fileContent = {
        servers: {}
      };
      var filepath = "bugs.json";

      fs.writeFile(filepath, fileContent, err => {
        if (err) throw err;

        console.log("Configuration file generated at Config.json");
      });
    }
  });
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${
      guild.memberCount
    } members!`
  );
  client.user.setActivity(`on ${client.guilds.size} servers`);

  if (config.serverconfigs && !config.serverconfigs.hasOwnProperty(guild.id)) {
    config.serverconfigs[guild.id] = defaultConfig;
  }

  // Get default
  const channel = getDefaultChannel(guild);
  channel.send("Thanks for adding me!\n\nMy prefix is `" + config.serverconfigs[guild.id].prefix + "`\nYou can see a list of commands with `" + config.serverconfigs[guild.id].prefix + "help`\nOr you can change my prefix with `" + config.serverconfigs[guild.id].prefix + "prefix`\n\nEnjoy!")

  fs.writeFileSync("./config.json", JSON.stringify(config));

});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`on ${client.guilds.size}`);
});

// This is called as, for instance:
client.on("guildMemberAdd", member => {
  const channel = getDefaultChannel(member.guild);
  channel.send(`Welcome ${member} to the server, wooh!`);
});

client.on("guildMemberRemove", member => {
  const channel = getDefaultChannel(member.guild);
  if (channel.send) {
    channel.send(`Farewell, ${member} will be missed!`);
  }
});

client.on("messageRemove", msg => {
  if (msg.channel.type !== "text") return;
  if (
    msg.channel.name &&
    msg.channel.name.includes(config.serverconfigs[msg.guild.id].modlogChannel)
  )
    return;
  fire(
    `**#${msg.channel.name} | ${msg.author.tag}'s message was deleted:** \`${
      msg.content
    }\``,
    msg.guild
  );
});

client.on("messageUpdate", (msg, newMsg) => {
  if (msg.content === newMsg.content) return;
  fire(
    `**#${msg.channel.name} | ${
      msg.author.tag
    } edited their message:**\n**before:** \`${msg.content}\`\n**+after:** \`${
      newMsg.content
    }\``,
    msg.guild
  );
});

client.on("guildMemberUpdate", (old, nw) => {
  let txt;
  if (old.roles.size !== nw.roles.size) {
    if (old.roles.size > nw.roles.size) {
      //Taken
      let dif = old.roles.filter(r => !nw.roles.has(r.id)).first();
      txt = `**${nw.user.tag} | Role taken -> \`${dif.name}\`**`;
    } else if (old.roles.size < nw.roles.size) {
      //Given
      let dif = nw.roles.filter(r => !old.roles.has(r.id)).first();
      txt = `**${nw.user.tag} | Role given -> \`${dif.name}\`**`;
    }
  } else if (old.nickname !== nw.nickname) {
    txt = `**${nw.user.tag} | Changed their nickname to -> \`${
      nw.nickname
    }\`**`;
  } else return;
  fire(txt, nw.guild);
});

client.on("roleCreate", role => {
  fire("**New role created**", role.guild);
});

client.on("roleDelete", role => {
  fire("**Role deleted -> `" + role.name + "`**", role.guild);
});

client.on("roleUpdate", (old, nw) => {
  let txt;
  if (old.name !== nw.name) {
    txt = `**${old.name} | Role name updated to -> \`${nw.name}\`**`;
  } else return;
  fire(txt, nw.guild);
});

client.on("guildBanAdd", (guild, user) => {
  fire(`**User banned -> \`${user.tag}\`**`, guild);
});

client.on("guildBanRemove", (guild, user) => {
  fire(`**User unbanned -> \`${user.tag}\`**`, guild);
});

// Commands
client.on("message", async message => {
  if (message.guild) {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    // TODO Automod filter
    if (config.serverconfigs[message.guild.id] && message.content.indexOf(config.serverconfigs[message.guild.id].prefix) !== 0) {
      automod.censor(message);
    } else {
      if (config.userprofiles) {

        // XP and leveling
        config.userprofiles[message.member.user.id].xp += 100;
        fs.writeFileSync("./config.json", JSON.stringify(config));
        if (config.userprofiles[message.member.user.id].xp < Math.round(Math.pow(100, (((config.userprofiles[message.member.user.id].level) / 10) + 1)))) {

        } else {
          config.userprofiles[message.member.user.id].xp = 0;
          config.userprofiles[message.member.user.id].level += 1;
          fs.writeFileSync("./config.json", JSON.stringify(config));

          const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setThumbnail(message.member.user.avatarURL)
            .setTitle(`${message.member.user.username} just leveled up!`)
            .setDescription(`**New Level: ${config.userprofiles[message.member.user.id].level}**, XP has been reset`)
            .setFooter(`XP until next level: ${Math.round(Math.pow(100, (((config.userprofiles[message.member.user.id].level) / 10) + 1)))}`, client.user.avatarURL)
          message.channel.send({
            embed
          });

        }
      }


      // Here we separate our "command" name, and our "arguments" for the command.
      // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
      // command = say
      // args = ["Is", "this", "the", "real", "life?"]
      const args = message.content
        .slice(config.serverconfigs[message.guild.id].prefix.length)
        .trim()
        .split(/ +/g);
      const command = args.shift().toLowerCase();

      // Admin

      admin.bot(client, message, command, args, defaultConfig);

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

      // Translate

      translate.bot(client, message, command, args);

      // Crypto

      crypto.bot(client, message, command, args);

      // Profile

      profile.bot(client, message, command, args);

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
          m.edit(res.data.joke);
        });
      }
    }
  }
});

const fire = (text, guild) => {
  if (!guild.channels) return;

  let channel = guild.channels.find(
    c => c.name && c.name.includes(config.serverconfigs[guild.id].modlogChannel)
  );

  if (!channel) {
    console.log("Channel not found");
    return;
  }

  let time = `**\`[${moment().format("M/D/YY - hh:mm")}]\`** `
  channel.send(time + text, {
    split: true
  }).then().catch(console.log);
}

const getDefaultChannel = (guild) => {
  // get "original" default channel
  if (guild.channels.has(guild.id))
    return guild.channels.get(guild.id)

  // Check for a "general" channel, which is often default chat
  if (guild.channels.exists("name", "general"))
    return guild.channels.find("name", "general");
  // Now we get into the heavy stuff: first channel in order where the bot can speak
  // hold on to your hats!
  return guild.channels
    .filter(c => c.type === "text" &&
      c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
    .sort((a, b) => a.position - b.position ||
      Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
    .first();
}

// Login
//
client.login(config.token);