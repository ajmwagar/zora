var start = Date.now();
// Load up the discord.js library
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `client.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

const config = require("../config.json");
// const profiles = require("../profiles.json");

const DBL = require("dblapi.js");

const dbl = new DBL(config.dbltoken, client);

// Optional events
dbl.on("posted", () => {
  console.log("Server count posted!");
});

dbl.on("error", e => {
  console.log(`Oops! ${e}`);
});

fs.openSync("./config.json", "r", (err, fd) => {
  if (err) {
    console.log("No config file detected.");
    var fileContent = {
      token: "",
      dbltoken: "",
      youtubeKey: "",
      serverconfigs: {}
    };
    fs.writeFileSync("./config.json", JSON.stringify(fileContent), err => {
      if (err) throw err;
    });

    console.log(
      "Configuration file generated at ./config.json \n Please add your bot token and youtube api key, then restart the bot."
    );
    process.exit(0);
  }
});
/*
fs.openSync("./profiles.json", "r", (err, fd) => {
  if (err) {
    console.log("No config file detected.");
    var fileContent = {
      userprofiles: {}
    };
    fs.writeFileSync("./profiles.json", JSON.stringify(fileContent), err => {
      if (err) throw err;
    });

    console.log("Profiles file generated at ./profiles.json");
    process.exit(0);
  }
});
*/

// Here we load the config.json file that contains our token and our prefix values.
const bugs = require("../bugs.json");
// config.token contains the bot's token
// config.serverconfigs[message.guild.id].prefix contains the message prefix.

const axios = require("axios");
const moment = require("moment");
var Long = require("long");
const chalk = require("chalk");

// Internal modules
const automod = require("./automod");
const admin = require("./admin");
const memes = require("./reddit");
const games = require("./games");
const radio = require("./radio");
const weather = require("./weather");
const yoda = require("./yoda");
const overflow = require("./overflow");
const utility = require("./utility");
const translate = require("./translate");
const crypto = require("./crypto");
const profile = require("./profile");
const wolfram = require("./wolfram");
const modlog = require("./events/modlog");

// URL that points to MongoDB database
var url = "mongodb://localhost:27017/zora";

// Connect/Create MongoDB database
mongoose.connect(url, {
  user: config.databaseuser,
  pass: config.databasepass
});

// Default server configuration (also used with .clearcfg)
var defaultConfig = new Schema({
  name: {
    type: String,
    default: ''
  },
  _id: Schema.Types.Decimal128,
  prefix: {
    type: String,
    default: "+"
  },
  modlogChannel: {
    type: String,
    default: "modlog"
  },
  welcomes: {
    type: Boolean,
    default: false
  },
  modules: {
    music: {
      type: Boolean,
      default: true
    },
    gamestats: {
      type: Boolean,
      default: true
    },
    modlog: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    users: {
      type: Number,
      default: 0
    },
    richest: {
      id: Schema.Types.Decimal128,
      name: {
        type: String,
        default: ''
      },
      zcoins: {
        type: Number,
        default: 0
      },
      level: {
        type: Number,
        default: 0
      }
    }
  },
  premium: {
    type: Boolean,
    default: false
  },
  reddit: {
    subreddits: [],
    posts: {
      type: String,
      default: 3
    },
    channel: {
      type: String,
      default: "memes"
    },
    interval: {
      type: Number,
      default: 1
    }
  },
  automod: {
    bannedwords: []
  }
});

// Default user profile config
var defaultprofile = new Schema({
  level: {
    type: Number,
    default: "1"
  },
  username: String,
  profileurl: String,
  xp: {
    type: Number,
    default: "0"
  },
  zcoins: {
    type: Number,
    default: "100"
  },
  VIP: {
    type: Boolean,
    default: false
  },
  inventory: [],
  _id: Schema.Types.Decimal128
});

// Define models
const UserM = mongoose.model("Users", defaultprofile);
const ServerM = mongoose.model("Servers", defaultConfig);

// var memeInterval = setInterval(getMemes, config.reddit.interval * 1000 * 60 * 60);

client.on("ready", async function () {

  /**
   * Update on start
   */

  // Get from database and sort!
  const getSort = () => {
    return UserM.find({}).sort({
      zcoins: -1
    }).exec()
  }

  var sorted = await getSort();

  // Default to 100
  var top = parseInt(args[0]) || 25;

  // Add fields
  var counter = 1;
  for (var usr in sorted) {
    var profile = sorted[counter - 1];
    if (profile) {
      if (counter <= top && counter <= 25) {
        if (counter === 1) {
          UserM.findById(profile._id, function (err, user) {
            server.stats.richest.id = profile.id;
            server.stats.richest.name = profile.username;
            server.stats.richest.zcoins = profile.zcoins;
            server.stats.richest.level = profile.level;
            server.save();
          });
        }
      }
    }
  }

  /**
   * Start the main loop, this runs every hour
   * used to update things such as stats
   */

  var j = schedule.scheduleJob('0 * * * *', function () {
    // Get from database and sort!
    const getSort = () => {
      return UserM.find({}).sort({
        zcoins: -1
      }).exec()
    }

    var sorted = await getSort();

    // Default to 100
    var top = parseInt(args[0]) || 25;

    // Add fields
    var counter = 1;
    for (var usr in sorted) {
      var profile = sorted[counter - 1];
      if (profile) {
        if (counter <= top && counter <= 25) {
          if (counter === 1) {
            UserM.findById(profile._id, function (err, user) {
              server.stats.richest.id = profile.id;
              server.stats.richest.name = profile.username;
              server.stats.richest.zcoins = profile.zcoins;
              server.stats.richest.level = profile.level;
              server.save();
            });
          }
        }
      }
    }
  });


  // Set activity
  setInterval(function () {
    client.user.setActivity(`on ${client.guilds.size} servers | ${client.users.size} users`);
  }, 10000);


  console.log(chalk.green("Client Ready!"));
  BotUsers = client.users;

  // Write users into database
  BotUsers.forEach(function (user) {
    if (user instanceof Discord.User) {
      var defaultuser = new UserM();
      defaultuser._id = user.id;
      defaultuser.username = user.username;
      defaultuser.save(function (err) {});
      /*console.log(
        chalk.yellow(
          chalk.blue(`[USER] `) +
          `${user.username} has been inserted into the database` +
          chalk.blue(`[ID] ${user.id}`)
        )
      );*/
    }
  });

  // Write servers into database
  client.guilds.forEach(function (guild) {
    var defaultserver = new ServerM();
    defaultserver._id = guild.id;
    defaultserver.name = guild.name;
    defaultserver.save(function (err) {});
    console.log(
      chalk.yellow(
        chalk.red(`[SERVER] `) +
        `${guild.id} has been inserted into the database`
      )
    );
  });

  // This event will run if the bot starts, and logs in, successfully.
  console.log("Shard startup took: " + (new Date().getTime() - start) + "MS");
  if (client.shard) {
    console.log(
      chalk.green(
        "Shard #" +
        client.shard.id +
        " active with " +
        client.guilds.size +
        " guilds"
      )
    );
  } else {
    console.log(
      chalk.green("Shard #0 active with " + client.guilds.size + " guilds")
    );
    client.user.setPresence({
      game: {
        name: "@Nitro help | " + client.guilds.size + " guilds",
        type: 0
      }
    });
  }
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${
      guild.memberCount
    } members!`
  );


  // Add this new guild to database
  var defaultserver = new defaultServer();
  defaultserver._id = guild.id;
  defaultserver.name = guild.name
  defaultserver.save(function (err) {});
  console.log(
    chalk.yellow(
      chalk.red(`[SERVER] `) + `${guild.id} has been inserted into the database`
    )
  );
  guild.members.forEach(function (guildMember) {
    if (guildMember.user instanceof Discord.User) {
      var defaultuser = new UserM();
      defaultuser._id = guildMember.user.id;
      defaultuser.username = guildMember.user.username;
      defaultuser.save(function (err) {});
      console.log(
        chalk.yellow(
          chalk.blue(`[USER] `) +
          `${guildMember.user.username} has been inserted into the database` +
          chalk.blue(`[ID] ${guildMember.user.id}`)
        )
      );
    }
  });

  // Get the new server's prefix
  let newprefix = "";
  ServerM.findById(guild.id, function (err, server) {
    newprefix = server.prefix;
  });

  // Get default
  const channel = getDefaultChannel(guild);
  channel.send(
    "Thanks for adding me!\n\nMy prefix is `" +
    newprefix +
    "`\nYou can see a list of commands with `" +
    newprefix +
    "help`\nOr you can change my prefix with `" +
    newprefix +
    "prefix`\n\nEnjoy!"
  );
});

client.on("channelCreate", channel => {
  // Get the modlog channel
  if (channel.type == "dm") return;
  let modlog = "";
  ServerM.findById(channel.guild.id, function (err, server) {
    modlog = server.modlogChannel;
  });
  if (channel.name && channel.name.includes(modlog)) return;
  fire(`**a channel was created:** #\`${channel.name}\``, channel.guild);
});

client.on("channelDelete", channel => {
  // Get the modlog channel
  if (channel.type == "dm") return;
  let modlog = "";
  ServerM.findById(channel.guild.id, function (err, server) {
    modlog = server.modlogChannel;
  });
  if (channel.name && channel.name.includes(modlog)) return;
  fire(`**  a channel was deleted:** #\`${channel.name}\``, channel.guild);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`on ${client.guilds.size}`);
});

// This is called as, for instance:
client.on("guildMemberAdd", member => {
  ServerM.findById(member.guild.id, function (err, server) {
    server.stats.users = member.guild.memberCount;
    server.save();
  });
  let welcomestate = false;
  ServerM.findById(member.guild.id, function (err, server) {
    welcomestate = server.welcomes;
  });
  if (welcomestate == true) {
    const channel = getDefaultChannel(member.guild);
    channel.send(`Welcome ${member} to the server, wooh!`);
  }
});

client.on("guildMemberRemove", member => {
  ServerM.findById(member.guild.id, function (err, server) {
    server.stats.users = member.guild.memberCount;
    server.save();
  });
  let welcomestate = false;
  ServerM.findById(member.guild.id, function (err, server) {
    welcomestate = server.welcomes;
  });
  if (welcomestate == true) {
    const channel = getDefaultChannel(member.guild);
    if (channel.send) {
      channel.send(`Farewell, ${member} will be missed!`);
    }
  }
});

client.on("messageDelete", msg => {
  // Get the modlog channel
  let modlog = "";
  ServerM.findById(msg.channel.guild.id, function (err, server) {
    modlog = server.modlogChannel;
  });

  if (msg.channel.type !== "text") return;
  if (msg.author.bot) return;
  if (msg.channel.name && msg.channel.name.includes(modlog)) return;
  fire(
    `**#${msg.channel.name} | ${msg.author.tag}'s message was deleted:** \`${
      msg.content
    }\``,
    msg.guild
  );
});

client.on("messageUpdate", (msg, newMsg) => {
  if (msg.content === newMsg.content) return;
  if (msg.author.bot) return;
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

    // Spy code :D
    console.log(chalk.white(`[Message] ${message.author.id}  ||||>>   `) + chalk.grey(message))

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.

    const cserver = await getConfig(message.guild.id);
    const cuser = await getUserConfig(message.author.id);


    // TODO Automod filter
    if (message.content.indexOf(cserver.prefix) !== 0) {
      automod.censor(message, cserver);
    } else {
      // XP and leveling
      UserM.findById(message.author.id, function (err, user) {
        user.xp += 100;
        user.save();
      });
      // fs.writeFileSync("./profiles.json", JSON.stringify(profiles));
      UserM.findById(message.author.id, function (err, user) {
        if (user.xp < Math.round(Math.pow(100, user.level / 10 + 1))) {} else {
          user.xp = 0;
          user.level += 1;
          user.save();
          const embed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF7F50")
            .setThumbnail(message.member.user.avatarURL)
            .setTitle(`${message.member.user.username} just leveled up!`)
            .setDescription(`**New Level: ${user.level}**, XP has been reset`)
            .setFooter(
              `XP until next level: ${Math.round(
                Math.pow(100, user.level / 10 + 1)
              )}`,
              client.user.avatarURL
            );
          message.channel.send({
            embed
          });
        }
      });
      // fs.writeFileSync("./profiles.json", JSON.stringify(profiles));

      // Here we separate our "command" name, and our "arguments" for the command.
      // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
      // command = say
      // args = ["Is", "this", "the", "real", "life?"]
      const args = message.content
        .slice(cserver.prefix.length)
        .trim()
        .split(/ +/g);
      const command = args.shift().toLowerCase();

      // ServerM is the model for server configs
      // UserM is the model for user configs
      // cuser refrences the current user config object
      // cserver refrences the current server config object

      // Admin
      UserM.findById(message.author.id, function (err, user) {

        admin.bot(client, message, command, args, defaultConfig, defaultprofile, user, cserver, UserM, ServerM);

        // Weather

        weather.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Memes

        memes.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Music
        if (cserver.modules.music == true) {
          radio.bot(client, message, command, args, user, cserver, UserM, ServerM);
        }
        // Game stats
        if (cserver.modules.gamestats == true) {
          games.bot(client, message, command, args, user, cserver, UserM, ServerM);
        }

        // Yodaspeak

        yoda.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Stack Overflow

        overflow.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Utility

        utility.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Translate

        translate.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Crypto

        crypto.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Profile

        profile.bot(client, message, command, args, user, cserver, UserM, ServerM);

        // Wolfram Alpha

        wolfram.bot(client, message, command, args, user, cserver, UserM, ServerM);

      });

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

const fire = async (text, guild) => {

  let ModlogEnabled = false;
  ServerM.findById(guild.id, function (err, server) {
    ModlogEnabled = server.modules.modlog
  });

  if (ModlogEnabled == true) {
    var cserver = await getConfig(guild.id);

    if (guild)
      if (!guild.channels) return;

    let channel = guild.channels.find(
      c => cserver && c.name && c.name.includes(cserver.modlogChannel)
    );

    if (!channel) {
      //console.log(cserver);
      //console.log(channel);
      console.log(chalk.yellow("Channel not found"));
      return;
    }

    let time = `**\`[${moment().format("M/D/YY - hh:mm")}]\`** `;
    var msg = time + text;
    channel
      .send({
        embed: {
          color: 12370112,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: "Modlog",
          description: msg
        }
      })
      .then()
      .catch();
  }
};

// Get the current server and user configs
const getUserConfig = (id) => {
  return ServerM.findById(id).exec();
}
const getConfig = (id) => {
  return ServerM.findById(id).exec()
}

const getDefaultChannel = guild => {
  // get "original" default channel
  if (guild.channels.has(guild.id)) return guild.channels.get(guild.id);

  // Check for a "general" channel, which is often default chat
  if (guild.channels.exists("name", "general"))
    return guild.channels.find("name", "general");
  // Now we get into the heavy stuff: first channel in order where the bot can speak
  // hold on to your hats!
  return guild.channels
    .filter(
      c =>
      c.type === "text" &&
      c.permissionsFor(guild.client.user).has("SEND_MESSAGES")
    )
    .sort(
      (a, b) =>
      a.position - b.position ||
      Long.fromString(a.id)
      .sub(Long.fromString(b.id))
      .toNumber()
    )
    .first();
};

// Login
//
client.login(config.token);