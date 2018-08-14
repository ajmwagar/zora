const config = require("./config.json");

async function bot(client, message, command, args){
  if (command === "help"){
    // Help message
    // Lists of current commands
    let help = [
      "",
      "",
      "Hi there, I'm " + config.name + ".",
      "",
      "My commands are:",
      "- `" + config.prefix + "help`: show this help menu",
      "- `" + config.prefix + "ban <user>`: ban a user (admins only)",
      "- `" + config.prefix + "kick <user>`: kick a user (admins and mods only)",
      "- `" + config.prefix + "purge <number of messages>`: purge a channel",
      "- `" + config.prefix + "ping`: Pong?",
      "- `" + config.prefix + "say <message>`: say a message",
      "- `" + config.prefix + "joke`: Tell a joke",
      "- `" + config.prefix + "weather <city>`: Get the weather for a city",
      "- `" + config.prefix + "setmemechannel <channel>`: Set channel for dumbing memes",
      "- `" + config.prefix + "setmemeinterval <interval>`: Set interval for dumbing memes (in hours)",
      "- `" + config.prefix + "addsub <subreddit name>`: add a subreddit for getting memes (/r/ format)",
      "- `" + config.prefix + "removesub <subreddit name>`: remove a subreddit for getting memes (/r/ format)",
      "- `" + config.prefix + "memes`: get memes now",
      "",
      "Hope I could help!",
      "",
      "Keep on fragging!"
    ].join("\n")

    // Reply to message
    message.reply(help);
  }

  else if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  else if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o => {});
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }

  else if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Owner", "Administrator", "Moderator"].includes(r.name)) )
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

  }

  else if(command === "ban") {
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
  }

  else if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    if(!message.member.roles.some(r=>["Owner", "Administrator"].includes(r.name)) )
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

module.exports = {bot};
