const config = require("./config.json");

async function bot(client, message, command, args) {
  if (command === "help") {
    // Help message
    // Lists of current commands
    message.channel.send({
      embed: {
        color: 3447003,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Commands for " + client.user.username,
        url: "https://github.com/ajmwagar/discordbot",
        description: "My prefix is " + config.prefix,
        fields: [{
            name: config.prefix + "help",
            value: "show this help menu"
          },
          {
            name: config.prefix + "ban <user>",
            value: "ban a user (admins only)"
          },
          {
            name: config.prefix + "kick <user>",
            value: "kick a user (admins and mods only)"
          },
          {
            name: config.prefix + "purge <number of messages>",
            value: "purge a channel"
          },
          {
            name: config.prefix + "ping",
            value: "Pong?"
          },
          {
            name: config.prefix + "say <message>",
            value: "say a message"
          },
          {
            name: config.prefix + "joke",
            value: "Tell a joke"
          },
          {
            name: config.prefix + "weather <city>",
            value: "Get the weather for a city"
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© " + message.guild
        }
      }
    });
    message.channel.send({
      embed: {
        color: 0xff5323,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Meme Commands for " + client.user.username,
        url: "https://github.com/ajmwagar/discordbot",
        description: "My prefix is " + config.prefix,
        fields: [
          {
            name: config.prefix + "subs",
            value: "Lists subscribed subreddits."
          },
          {
            name: config.prefix + "setmemechannel <channel>",
            value: "Set channel for dumbing memes"
          },
          {
            name: config.prefix + "setmemeinterval <interval>",
            value: "Set interval for dumbing memes (in hours)"
          },
          {
            name: config.prefix + "addsub <subreddit name>",
            value: "add a subreddit for getting memes (/r/ format)"
          },
          {
            name: config.prefix + "removesub <subreddit name>",
            value: "remove a subreddit for getting memes (/r/ format)"
          },
          {
            name: config.prefix + "memes",
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
    message.channel.send({
      embed: {
        color: 3066993,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Music Commands for " + client.user.username,
        url: "https://github.com/ajmwagar/discordbot",
        description: "My prefix is " + config.prefix,
        fields: [{
            name: config.prefix + "join",
            value: "Join Voice channel of message sender"
          },
          {
            name: config.prefix + "add",
            value: "Add a valid youtube link to the queue"
          },
          {
            name: config.prefix + "queue",
            value: "Shows the current queue, up to 15 songs shown."
          },
          {
            name: config.prefix + "play",
            value: "Play the music queue if already joined to a voice channel"
          },
          {
            name: config.prefix + "pause",
            value: "pauses the music"
          },
          {
            name: config.prefix + "resume",
            value: "resumes the music"
          },
          {
            name: config.prefix + "skip",
            value: "skips the playing song"
          },
          {
            name: config.prefix + "time",
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
  }
}

module.exports = {
  bot
};
