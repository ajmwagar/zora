const Discord = require("discord.js");
const fs = require('fs');
const config = require("../config.json");
const profiles = require("../profiles.json");

async function bot(client, message, command, args, defaultConfig, defaultprofile) {
  if (command === "help") {
    var helpprefix = config.serverconfigs[message.guild.id].prefix;
    // Help message
    // Lists of current commands
    message.reply("please check your direct messages.");

    // Help message
    message.author.send({
      embed: {
        color: 12370112,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: client.user.username + " - About",
        description: "This bot was created by Avery Wagar & Nathan Laha",
        fields: [{
          name: `Check out the Github, host your own, or invite one of ours! (try ${helpprefix}invite)`,
          value: "https://github.com/ajmwagar/discordbot"
        }]
      }
    });
    message.author.send({
      embed: {
        color: 12370112,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Admin Commands for " + client.user.username,
        description: "My prefix is " + helpprefix,
        fields: [{
            name: helpprefix + "help",
            value: "show this help menu"
          },
          {
            name: helpprefix + "ban <user>",
            value: "ban a user (admins only)"
          },
          {
            name: helpprefix + "setlog <channel>",
            value: "Set channel for modlog"
          },
          {
            name: helpprefix + "kick <user>",
            value: "kick a user (admins and mods only)"
          },
          {
            name: helpprefix + "purge <number of messages>",
            value: "purge a channel"
          },
          {
            name: helpprefix + "bws",
            value: "List banned words for automod"
          },
          {
            name: helpprefix + "addbw <words>",
            value: "Add words to ban list"
          },
          {
            name: helpprefix + "removebw <words>",
            value: "Remove words from ban list"
          },
          {
            name: helpprefix + "ping",
            value: "Pong?"
          },
          {
            name: helpprefix + "say <message>",
            value: "say a message"
          },
          {
            name: helpprefix + "prefix",
            value: "Sets the bot prefix"
          },
          {
            name: helpprefix + "alexamode",
            value: "Changes the prefix to Alexa <command>"
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© " + message.guild
        }
      }
    });
    message.author.send({
      embed: {
        color: 3447003,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Utility/Joke Commands for " + client.user.username,
        description: "My prefix is " + helpprefix,
        fields: [{
            name: helpprefix + "weather <city>",
            value: "Get the weather for a city"
          },
          {
            name: helpprefix + "joke",
            value: "Tell a joke"
          },
          {
            name: helpprefix + "yoda <message>",
            value: "Translates your message to yodaspeak!"
          },
          {
            name: helpprefix + "stack <search query>",
            value: "Searches stack overflow"
          },
          {
            name: helpprefix + "dice <number of sides>",
            value: "Roles a dice with a number of sides"
          },
          {
            name: helpprefix + "coinflip",
            value: "Flips a coin"
          },
          {
            name: helpprefix + "math <number1> <operator> <number2>",
            value: "Does basic math operations. Gets pissed off if you divide by 0"
          },
          {
            name: helpprefix + "dab",
            value: "Dabs on them haters"
          },
          {
            name: helpprefix + "translate <language code> <input text>",
            value: "Translate's input to specified language, for a list of ISO 639-1 codes go to: [wikipedia](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)"
          },
          {
            name: helpprefix + "currency <to> <from> (Example: BTC USD)",
            value: "Gets and compares currency prices"
          },
          {
            name: helpprefix + "bug <description>",
            value: "Report a bug"
          },
          {
            name: helpprefix + "credits",
            value: "Visit the github repo!"
          },
          {
            name: helpprefix + "invite",
            value: "Invite our official bot to your server!"
          },
          {
            name: helpprefix + "support",
            value: "Join our support server."
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© " + message.guild
        }
      }
    });
    message.author.send({
      embed: {
        color: 0xff5323,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Money Commands for " + client.user.username,
        description: "My prefix is " + helpprefix,
        fields: [{
            name: helpprefix + "daily",
            value: "Get 500 ZCoins every 24 hours"
          },
          {
            name: helpprefix + "slots",
            value: "Test your luck with 250 ZCoins!"
          },
          {
            name: helpprefix + "profile",
            value: "View your user profile (xp, zcoins, level)"
          },
          {
            name: helpprefix + "shop",
            value: "View the shop"
          },
          {
            name: helpprefix + "buy",
            value: "Buy items from the shop"
          },
          {
            name: helpprefix + "forbes",
            value: "Checkout the richest people alive. Forbes."
          },
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© " + message.guild
        }
      }
    });
    message.author.send({
      embed: {
        color: 0xff5323,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Meme Commands for " + client.user.username,
        description: "My prefix is " + helpprefix,
        fields: [{
            name: helpprefix + "subs",
            value: "Lists subscribed subreddits."
          },
          {
            name: helpprefix + "setmemechannel <channel>",
            value: "Set channel for dumping memes"
          },
          {
            name: helpprefix + "setmemeinterval <interval>",
            value: "Set interval for dumping memes (in hours)"
          },
          {
            name: helpprefix + "addsub <subreddit name>",
            value: "add a subreddit for getting memes (/r/ format)"
          },
          {
            name: helpprefix + "removesub <subreddit name>",
            value: "remove a subreddit for getting memes (/r/ format)"
          },
          {
            name: helpprefix + "memes",
            value: "gets all the memes from Reddit"
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© " + message.guild
        }
      }
    });
    message.author.send({
      embed: {
        color: 3066993,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Music Commands for " + client.user.username,
        description: "My prefix is " + helpprefix,
        fields: [{
            name: helpprefix + "join",
            value: "Join Voice channel of message sender"
          },
          {
            name: helpprefix + "add",
            value: "Add a valid youtube link to the queue"
          },
          {
            name: helpprefix + "queue",
            value: "Shows the current queue, up to 15 songs shown."
          },
          {
            name: helpprefix + "play",
            value: "Play the music queue if already joined to a voice channel"
          },
          {
            name: helpprefix + "pause",
            value: "pauses the music"
          },
          {
            name: helpprefix + "resume",
            value: "resumes the music"
          },
          {
            name: helpprefix + "skip",
            value: "skips the playing song"
          },
          {
            name: helpprefix + "time",
            value: "Shows the playtime of the song."
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© " + message.guild
        }
      }
    });
  } else if (command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  } else if (command === "clearcfg") {
    // Only allow admins to wipe server config
    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply("Sorry, you don't have permissions to use this!");
    // Reload and clear CFG
    console.log(
      `Config cleared for: ${message.guild.name} (id: ${message.guild.id}). This guild has ${
      message.guild.memberCount
    } members!`
    );
    config.serverconfigs[message.guild.id] = defaultConfig;
    fs.writeFileSync("./profiles.json", JSON.stringify(config));
    message.channel.send(`Server Config Reloaded! My prefix is now "${config.serverconfigs[message.guild.id].prefix}"`);
  } else if (command === "clearprofiles") {
    // Only allow Bot Owners to wipe user config
    if (!message.author.id == "205419165366878211" || !message.author.id == "226021264018374656")
      return message.reply("Sorry, you don't have permissions to use this!");
    // Reload and clear CFG
    console.log('Userprofiles Cleared')
    client.guilds.forEach(function (guild) {
      // Initialize User Profiles
      guild.members.forEach(function (member) {
        profiles.userprofiles[member.user.id] = defaultprofile;
      });
      fs.writeFileSync("./profiles.json", JSON.stringify(profiles));
    });
    message.channel.send(`User Config Reloaded!`);

  } else if (command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o => {});
    // And we get the bot to say the thing: 
    message.channel.send(`**${message.author} Said:\n** ` + sayMessage);
  } else if (command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if (!message.member.permissions.has('ADMINISTRATOR'))
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
    if (!message.member.permissions.has('ADMINISTRATOR'))
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
    if (!message.member.permissions.has('ADMINISTRATOR'))
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
    message.channel.bulkDelete(fetched).then(() => message.channel.send(":white_check_mark:"))
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  } else if (command === "prefix") {
    // This command changes the bot prefix
    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply("Sorry, you don't have permissions to use this!");

    if (args.length > 0) {

      var setPrefix = args[0];

      if (setPrefix !== undefined || setPrefix !== "") {
        config.serverconfigs[message.guild.id].prefix = setPrefix;
        fs.writeFile('./config.json', JSON.stringify(config), (err) => {});
        message.channel.send({
          embed: {
            color: 3447003,
            description: `Bot prefix changed to ${config.serverconfigs[message.guild.id].prefix}`
          }
        });
      }
    } else {
      message.channel.send(`Please specify a prefix with ${config.serverconfigs[message.guild.id].prefix}prefix <new prefix>`);
    }


  } else if (command === "alexamode") {
    // This command changes the bot prefix to "Alexa"
    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply("Sorry, you don't have permissions to use this!");


    config.serverconfigs[message.guild.id].prefix = "Alexa ";

    message.channel.send({
      embed: {
        color: 3447003,
        description: `Bot prefix changed to ${config.serverconfigs[message.guild.id].prefix}, type Alexa <command>`
      }
    });
  } else if (command === "addbw") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply("Sorry, you don't have permissions to use this!");

    args.forEach((word) => {
      // Add word
      config.serverconfigs[message.guild.id].automod.bannedwords.push(word);

      // Alert user
      let embed = new Discord.RichEmbed()
        .setTitle(`Added ${word} to banned words`)
        .setAuthor(client.user.username + " - AUTOMOD", client.user.avatarURL)
        .setColor(15844367)

      message.channel.send({
        embed
      })
      fs.writeFile('./config.json', JSON.stringify(config), (err) => {});
    })


  } else if (command === "removebw") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply("Sorry, you don't have permissions to use this!");

    args.forEach((word) => {
      let index = config.serverconfigs[message.guild.id].automod.bannedwords.indexOf(word)


      if (index > -1) {

        // Add word
        config.serverconfigs[message.guild.id].automod.bannedwords.splice(index, 1);

        // Alert user
        let embed = new Discord.RichEmbed()
          .setTitle(`Removed ${word} from banned words`)
          .setAuthor(client.user.username + " - AUTOMOD", client.user.avatarURL)
          .setColor(15844367)

        message.channel.send({
          embed
        })
        fs.writeFile('./config.json', JSON.stringify(config), (err) => {});
      }
    })
  } else if (command === "bws") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply("Sorry, you don't have permissions to use this!");

    let embed = new Discord.RichEmbed()
      .setTitle("Banned Words")
      .setAuthor(client.user.username + "- AUTOMOD", client.user.avatarURL)
      .setColor(15844367)
      .setDescription("Currently moderating " + config.serverconfigs[message.guild.id].automod.bannedwords.length + " words.")

    message.channel.send({
      embed
    })

    config.serverconfigs[message.guild.id].automod.bannedwords.forEach((word) => {
      var embed = new Discord.RichEmbed().setTitle(word).setAuthor(client.user.username, client.user.avatarURL).setColor(3447003)
      message.channel.send({
        embed
      })
    })

  } else if (command === "credits") {
    message.author.send({
      embed: {
        color: 12370112,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: client.user.username + " - BOT",
        description: "This bot was created by Avery & Nathan",
        fields: [{
          name: "Check out the Github, host your own, or invite one of ours! (try +invite)",
          value: "https://github.com/ajmwagar/discordbot"
        }]
      }
    });
    message.reply("please check you direct messages.");
  } else if (command === "invite") {
    message.author.send("**Invite our official bot to your discord server!**\nhttps://discordapp.com/oauth2/authorize?client_id=478616471640080395&permissions=8&scope=bot");
    message.reply("please check you direct messages.");
  } else if (command === "reboot") {
    process.exit(0);
  } else if (command === "setlog") {
    var channel = args[0].trim()

    if (channel) {

      config.serverconfigs[message.guild.id].modlogChannel = channel;

      fs.writeFile("./config.json", JSON.stringify(config), (err) => {})

      return message.reply("Set channel to #" + channel);

    }

  }
}

module.exports = {
  bot
};