const Discord = require("discord.js");
const config = require("../config.json");
const YouTube = require('simple-youtube-api');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
console.log(ffmpeg.path, ffmpeg.version);
const ytdl = require('ytdl-core');

const youtube = new YouTube(config.youtubeKey);

const queue = new Map();

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {

  const searchString = args.join(' ');
  const url = args[0] ? args[0].replace(/<(.+)>/g, '$1') : '';
  const serverQueue = queue.get(message.guild.id);

  if (command === 'play') {
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('🆘 I\'m sorry but you need to be in a voice channel to play music!');
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
      return message.channel.send('🆘 I cannot connect to your voice channel, make sure I have the proper permissions!');
    }
    if (!permissions.has('SPEAK')) {
      return message.channel.send('🆘 I cannot speak in this voice channel, make sure I have the proper permissions!');
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      const m = await message.channel.send(`Adding playlist, please wait...`);
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, message, voiceChannel, true, client, cserver); // eslint-disable-line no-await-in-loop
      }
      return m.edit(`✅ Playlist: **${playlist.title}** has been added to the queue!`);
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          const embed = new Discord.RichEmbed()
            .setTitle("🔍 Search Results 🔍")
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor('#ff1c1c')
            .setDescription("**Please provide a value to select one of the search results ranging from 1-10. If no value is provided, the first song will be played!**\n\n" + `${videos.map(video2 => `**${++index} -** [${video2.title}](${video2.url})`).join('\n')}`)
            .setFooter(`Zora HD Music System`, client.user.avatarURL)
            .setTimestamp()
            .addBlankField(true)

          message.channel.send({
            embed
          });
          // eslint-disable-next-line max-depth
          try {
            var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
              maxMatches: 1,
              time: 10000,
              errors: ['time']
            });
            const videoIndex = parseInt(response.first().content) || 1;
            var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
          } catch (err) {
            var video = await youtube.getVideoByID(videos[0].id);
          }
        } catch (err) {
          console.error(err);
          return message.channel.send('🆘 I could not obtain any search results.');
        }
      }
      return handleVideo(video, message, voiceChannel, false, client, cserver);
    }
  } else if (command === 'skip') {
    if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
    if (!serverQueue) return message.channel.send('There is nothing playing that I could skip for you.');
    serverQueue.connection.dispatcher.end('Skip command has been used!');
    return undefined;
  } else if (command === 'stop') {
    if (!message.member.voiceChannel) return message.channel.send('You are not in a voice channel!');
    if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.');
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end('Stop command has been used!');
    return undefined;
  } else if (command === 'volume') {
    if (!message.member.voiceChannel) return message.channel.send('🆘 You are not in a voice channel!');
    if (!serverQueue) return message.channel.send('🆘 There is nothing playing.');
    if (!args[0]) return message.channel.send(`The current volume is: ** ${serverQueue.volume} ** `);
    serverQueue.volume = args[0];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 5);
    return message.channel.send(`I set the volume to: ** ${args[0]} ** `);
  } else if (command === 'np') {
    if (!serverQueue) return message.channel.send('🆘 There is nothing playing.');
    const embed = new Discord.RichEmbed()
      .setTitle(`💿 Now Playing: **${serverQueue.songs[0].title}**`)
      .setAuthor(message.member.user.username, message.member.user.avatarURL)
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor('#ff1c1c')
      .setFooter(`Zora HD Music System`, client.user.avatarURL)
      .setThumbnail(serverQueue.songs[0].thumbnail)
      .setTimestamp()
      .setURL(serverQueue.songs[0].url)
      .addBlankField(true)
      .addField(`**Video Description: **`, serverQueue.songs[0].description.substring(0, 150) + `\n**[... READ MORE](${serverQueue.songs[0].url})**`)
    if (serverQueue.songs[1] === undefined) {
      embed.setDescription(`**Requested by:** \`${serverQueue.songs[0].requestedby}\`\n**Length:** ${serverQueue.songs[0].duration}\n\`Use the play command to add some songs!\``)
    } else {
      embed.setDescription(`**Requested by:** ${serverQueue.songs[0].requestedby}\n**Length:** ${serverQueue.songs[0].duration}\n**Up Next:** \`${serverQueue.songs[1].title}\``)
    }

    message.channel.send({
      embed
    });
  } else if (command === 'queue') {
    if (!serverQueue) return message.channel.send('There is nothing playing.');
    let index = 0;
    const embed = new Discord.RichEmbed()
      .setTitle(`🎶  Song Queue 🎶 `)
      .setAuthor(message.member.user.username, message.member.user.avatarURL)
      .setAuthor(client.user.username, client.user.avatarURL)
      .setDescription('Queue will be cleared upon usage of the stop command.')
      .setColor('#ff1c1c')
      .setFooter(`Zora HD Music System`, client.user.avatarURL)
      .setTimestamp()
      .addBlankField(true)
      .addField(`**💿 Now playing 💿**`, `\n[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})\nRequested By: \`${serverQueue.songs[0].requestedby}\`\nLength: ${serverQueue.songs[0].duration}`)
      .addField(`**⬇️ Queue ⬇️**`, `Only the next 10 songs are shown...`)
    serverQueue.songs.map(function (song) {
      if (index < 10) {
        if (index == 0) {
          ++index;
        } else {
          embed.addField(`**Song: ${++index}**`, `[${song.title}](${song.url})\nRequested By: \`${song.requestedby}\``);
        }
      }
    })
    return message.channel.send({
      embed
    });
  } else if (command === 'pause') {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return message.channel.send('⏸ Paused the music for you!');
    }
    return message.channel.send('🆘 There is nothing playing.');
  } else if (command === 'resume') {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return message.channel.send('▶️ Resumed the music for you!');
    }
    return message.channel.send('🆘 There is nothing playing.');
  }

  return undefined;
}

async function handleVideo(video, message, voiceChannel, playlist = false, client, cserver) {
  const serverQueue = queue.get(message.guild.id);
  const song = {
    id: video.id,
    title: Discord.escapeMarkdown(video.title),
    thumbnail: video.thumbnails.default.url,
    requestedby: message.member.user.username,
    duration: `(Format: hh:mm:ss)  -  \`${video.duration.hours} : ${video.duration.minutes} : ${video.duration.seconds}\``,
    description: video.description,
    url: `https://www.youtube.com/watch?v=${video.id}`
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(message.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0], message, client, cserver);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(message.guild.id);
      return message.channel.send(`🆘 I could not join the voice channel: ${error}`);
    }
  } else {
    serverQueue.songs.push(song);
    if (playlist) {
      return undefined;
    } else {
      const embed = new Discord.RichEmbed()
        .setTitle(`✅ Added **${song.title}** to the Queue`)
        .setAuthor(message.member.user.username, message.member.user.avatarURL)
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor('#ff1c1c')
        .setFooter(`Zora HD Music System`, client.user.avatarURL)
        .setThumbnail(song.thumbnail)
        .setTimestamp()
        .setURL(song.url)
        .addBlankField(true)
        .addField(`**Video Description: **`, song.description.substring(0, 150) + `\n**[... READ MORE](${song.url})**`)
      if (serverQueue.songs[1] === undefined) {
        embed.setDescription(`**Requested by:** \`${message.member.user.username}\`\n**Length:** ${song.duration}\n\`Use the play command to add some songs!\``)
      } else {
        embed.setDescription(`**Requested by:** ${message.member.user.username}\n**Length:** ${song.duration}\n**Up Next:** \`${serverQueue.songs[1].title}\``)
      }

      return message.channel.send({
        embed
      });
    }
  }
  return undefined;
}

function play(guild, song, message, client, cserver) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', reason => {
      if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
      else console.log(reason);
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0], message, client);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  const embed = new Discord.RichEmbed()
    .setTitle(`💿 Now Playing: **${song.title}**`)
    .setAuthor(message.member.user.username, message.member.user.avatarURL)
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor('#ff1c1c')
    .setFooter(`Zora HD Music System`, client.user.avatarURL)
    .setThumbnail(song.thumbnail)
    .setTimestamp()
    .setURL(song.url)
    .addBlankField(true)
    .addField(`**Video Description: **`, song.description.substring(0, 150) + `\n**[... READ MORE](${song.url})**`)
  if (serverQueue.songs[1] === undefined) {
    embed.setDescription(`**Requested by:** \`${message.member.user.username}\`\n\n**Length:** ${song.duration}\n\n\`Use the play command to add some songs!\``)
  } else {
    embed.setDescription(`**Requested by:** ${message.member.user.username}\n\n**Length:** ${song.duration}\n\n**Up Next:** \`${serverQueue.songs[1].title}\``)
  }

  message.channel.send({
    embed
  });
}

module.exports = {
  bot
};