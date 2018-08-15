const Discord = require("discord.js");
const fs = require('fs');
const config = require("./config.json");

async function bot(client, message, command, args) {
  if (command === "help") {
    var helpprefix = config.serverconfigs[message.guild.id].prefix;
    // Help message
    // Lists of current commands
    message.author.send({
      embed: {
        color: 3447003,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Commands for " + client.user.username,
        url: "https://github.com/ajmwagar/discordbot",
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
            name: helpprefix + "joke",
            value: "Tell a joke"
          },
          {
            name: helpprefix + "weather <city>",
            value: "Get the weather for a city"
          },
          {
            name: helpprefix + "yoda <message>",
            value: "Translates your message to yodaspeak!"
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
        title: "Meme Commands for " + client.user.username,
        url: "https://github.com/ajmwagar/discordbot",
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
        url: "https://github.com/ajmwagar/discordbot",
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
  } else if (command === "prefix") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    // get the delete count, as an actual number.
    var setPrefix = args[0];

    config.serverconfigs[message.guild.id].prefix = setPrefix;

    message.channel.send({
      embed: {
        color: 3447003,
        description: `Bot prefix changed to ${config.serverconfigs[message.guild.id].prefix}`
      }
    });

  } else if (command === "addbw") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    args.forEach((word) => {
      // Add word
      config.serverconfigs[message.guild.id].automod.bannedwords.push(word);

      // Alert user
      message.channel.send({
        embed: {
          color: 3447003,
          description: `Added ${word} to banned words.`
        }
      })
      fs.writeFile('./config.json', JSON.stringify(config), (err) => {});
    })


  } else if (command === "removebw") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
      return message.reply("Sorry, you don't have permissions to use this!");

    args.forEach((word) => {
      let index = config.serverconfigs[message.guild.id].automod.bannedwords.indexOf(word)


      if (index > -1) {

        // Add word
        config.serverconfigs[message.guild.id].automod.bannedwords.splice(index, 1);

        // Alert user
        let embed = new Discord.RichEmbed()
          .setTitle(`Removed ${word} from banned words`)
          .setAuthor(client.user.username + "- AUTOMOD", client.user.avatarURL)
          .setColor(15844367)

        message.channel.send({
          embed
        })
        fs.writeFile('./config.json', JSON.stringify(config), (err) => {});
      }
    })
  } else if (command === "bws") {
    // This command removes all messages from all users in the channel, up to 100.
    if (!message.member.roles.some(r => ["Owner", "Administrator"].includes(r.name)))
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

  }
}

module.exports = {
  bot
};