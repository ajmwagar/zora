const config = require("./config.json");
const yt = require('ytdl-core');

let queue = {};
var radio;

async function bot(message, command, args){

  if (command === "play"){
    let url = args[0];

    // Get info of song
    yt.getInfo(url, (err, info) => {
      message.channel.send(url)
      if(err) return message.channel.send('Invalid YouTube Link: ' + err);

      if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
      queue[message.guild.id].songs.push({url: url, title: info.title, requester: message.author.username});



      // Check if already playing
      if (queue[message.guild.id].playing == false){

        queue[message.guild.id].playing = true;


        play(queue[message.guild.id].songs.shift())

        // Alert user
        message.channel.send("Playing: **" + queue[message.guild.id].songs.title + "**. requested by: **" + queue[message.guild.id].songs.requester + "**.")
      }
      // If playing add to queue
      else {
        message.channel.send("Added **" + queue[message.guild.id].songs.title + "** to queue. requested by: **" + queue[message.guild.id].songs.requester + "**")
      }
    });
  }

  else if (command === "stop"){
    // Stop playing
    radio.pause()
    queue[message.guild.id].playing = false;
    queue[message.guild.id].songs = [];

    // Alert user of action
    message.channel.send("Music stopped and queue cleared.");
  }

  else if (command === "skip"){
    // Skip song
    radio.end()
    message.channel.send("Skipped song.");
  }

  else if (command === "join"){
    return new Promise((resolve, reject) => {
      const voiceChannel = message.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return message.reply('I couldn\'t connect to your voice channel...');
      voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
    });
  }

  else if (command === "queue"){
    if (queue[message.guild.id] === undefined) return message.channel.send(`Add some songs to the queue first with ${config.prefix}add`);
    let tosend = [];
    queue[message.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
    message.channel.send(`__**${message.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
  }
}

  // Music

  // Play next song in queue
  function play(song){
    radio = message.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : config.passes });

    radio.on('end', () => {
      // collector.stop();
      play(queue[message.guild.id].songs.shift());
    });

    radio.on('error', (err) => {
      return message.channel.send('error: ' + err).then(() => {
        // collector.stop();
        play(queue[message.guild.id].songs.shift());
      });
    });
  }

  // Add song to queue
  function add(){

  }

  // Stop playing
  function stop(){

  }


module.exports = {bot};
