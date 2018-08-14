const config = require("./config.json");
const yt = require('ytdl-core');
const opus = require('opusscript');

let queue = {};
var radio;

async function bot(client, message, command, args) {
  const commands = {
    'play': (message) => {
      if (queue[message.guild.id] === undefined) {
        return message.channel.send({
          embed: {
            color: 15844367,
            description: `Add some songs to the queue first with ${config.prefix}add`
          }
        });
      }
      if (!message.guild.voiceConnection) return commands.join(message).then(() => commands.play(message));
      if (queue[message.guild.id].playing) {
        return message.channel.send({
          embed: {
            color: 15844367,
            description: "Already Playing!"
          }
        });
      }
      let dispatcher;
      queue[message.guild.id].playing = true;

      console.log(queue);
      (function play(song) {
        console.log(song);
        if (song === undefined) {
          return message.channel.send({
            embed: {
              color: 15844367,
              description: "Queue is empty"
            }
          }).then(() => {
            queue[message.guild.id].playing = false;
            message.member.voiceChannel.leave();
          });
        }
        message.channel.send({
          embed: {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: `▶️ Playing song requested by **${song.requester}**`,
            url: song.url,
            description: `Song Name: **${song.title}**`,
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "© " + message.guild
            }
          }
        });
        dispatcher = message.guild.voiceConnection.playStream(yt(song.url, {
          audioonly: true
        }), {
          passes: config.passes
        });
        let collector = message.channel.createCollector(m => m);
        collector.on('message', m => {
          if (m.content.startsWith(config.prefix + 'pause')) {
            message.channel.send({
              embed: {
                color: 3447003,
                description: "⏸️ Music Paused"
              }
            }).then(() => {
              dispatcher.pause();
            });
          } else if (m.content.startsWith(config.prefix + 'resume')) {
            message.channel.send({
              embed: {
                color: 3447003,
                description: "▶️ Music Resumed"
              }
            }).then(() => {
              dispatcher.resume();
            });
          } else if (m.content.startsWith(config.prefix + 'skip')) {
            message.channel.send({
              embed: {
                color: 3447003,
                description: "⏩ Song Skipped!"
              }
            }).then(() => {
              dispatcher.end();
            });
          } else if (m.content.startsWith(config.prefix + 'stop')) {
            message.channel.send({
              embed: {
                color: 10181046,
                description: "⏹️ Song stopped and Queue cleared (this command doesn't work yet)"
              }
            }).then(() => {
              // TODO Add stop command, we need to rework how the queue functions
            });
          } else if (m.content.startsWith(config.prefix + 'volume+')) {
            if (Math.round(dispatcher.volume * 50) >= 100) return message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
            dispatcher.setVolume(Math.min((dispatcher.volume * 50 + (2 * (m.content.split('+').length - 1))) / 50, 2));
            message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
          } else if (m.content.startsWith(config.prefix + 'volume-')) {
            if (Math.round(dispatcher.volume * 50) <= 0) return message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
            dispatcher.setVolume(Math.max((dispatcher.volume * 50 - (2 * (m.content.split('-').length - 1))) / 50, 0));
            message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
          } else if (m.content.startsWith(config.prefix + 'time')) {
            message.channel.send({
              embed: {
                color: 3447003,
                description: `Time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`
              }
            });
          }
        });
        dispatcher.on('end', () => {
          collector.stop();
          play(queue[message.guild.id].songs.shift());
        });
        dispatcher.on('error', (err) => {
          return message.channel.send('error: ' + err).then(() => {
            collector.stop();
            play(queue[message.guild.id].songs.shift());
          });
        });
      })(queue[message.guild.id].songs.shift());
    },
    'join': (message) => {
      return new Promise((resolve, reject) => {
        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel || voiceChannel.type !== 'voice') {
          return message.channel.send({
            embed: {
              color: 10181046,
              description: "I couldn't connect to your voice channel!"
            }
          });
        }
        voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
      });
    },
    'add': (message) => {
      let url = message.content.split(' ')[1];
      if (url == '' || url === undefined) {
        return message.channel.send({
          embed: {
            color: 10181046,
            description: `You must add a YouTube video url, or id after ${config.prefix}add`
          }
        });
      }
      yt.getInfo(url, (err, info) => {
        if (err) {
          return message.channel.send({
            embed: {
              color: 10181046,
              description: 'Invalid youtube link ' + err
            }
          });
        }
        if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
        queue[message.guild.id].songs.push({
          url: url,
          title: info.title,
          requester: message.author.username
        });
        message.channel.send({
          embed: {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: `added **${info.title}** to the queue`,
            url: info.url,
            description: info.length,
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "© " + message.guild
            }
          }
        });
      });
    },
    'queue': (message) => {
      if (queue[message.guild.id] === undefined) {
        return message.channel.send({
          embed: {
            color: 3447003,
            description: `Add some songs to the queue first with ${config.prefix}add`
          }
        });
      }
      let tosend = [];
      message.channel.send({
        embed: {
          color: 3447003,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: `Music queue for **${message.guild.name}**`,
          url: "https://github.com/ajmwagar/discordbot",
          description: 'Songs Queued **' + queue[message.guild.id].songs.length + '** [Only next 15 shown]',
          timestamp: new Date(),
          footer: {
            icon_url: client.user.avatarURL,
            text: "© Example"
          }
        }
      });
      queue[message.guild.id].songs.forEach((song, i) => {
        message.channel.send({
          embed: {
            color: 3447003,
            description: `${i+1}. ${song.title} - Requested by: **${song.requester}**`
          }
        });
      });
    },
    'reboot': (message) => {
      if (message.author.id == config.adminID) process.exit(); //Requires a node module like Forever to work.
    }
  };

  if (commands.hasOwnProperty(message.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) commands[message.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](message);
}


module.exports = {
  bot
};