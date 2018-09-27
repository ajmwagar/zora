const config = require("../config.json");
const yt = require('ytdl-core');
const {
  YTSearcher
} = require('ytsearcher');
// const ypi = require('youtube-playlist-info');
const opus = require('opusscript');

//Set the YouTube API key.
var searcher = new YTSearcher({
  key: config.youtubeKey,
  revealkey: true
});


let queue = {};
var radio;
let dispatcher;

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
  const commands = {
    'play': async (message) => {
        if (queue[message.guild.id] === undefined || queue[message.guild.id].length === 0) {
          console.log("Play: Empty Queue - Adding > Play");

          if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
          // Add and play
          if (!args.length == 0) {
            commands.add(message).then(() => {
              if (!message.guild.voiceConnection) return commands.join(message).then(() => playSong(queue[message.guild.id].songs.shift()))
            });
          }

        } else if (queue[message.guild.id].playing || args.length > 0) {
          if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
          console.log("Play: Already Playing -  Adding");

          // Add to queue
          if (args.length > 0) {
            await commands.add(message);
          } else {
            return message.channel.send({
              embed: {
                color: 15844367,
                description: "Already Playing!"
              }
            });
          }
        } else {
          if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
          console.log("Play: Playing next");
          // Play next song
          if (!message.guild.voiceConnection) return await commands.join(message).then(() => playSong(queue[message.guild.id].songs.shift()))
        }

        function playSong(song) {
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

          collector.on('collect', m => {
            if (m.content.startsWith(cserver.prefix + 'pause')) {
              message.channel.send({
                embed: {
                  color: 3447003,
                  description: "⏸️ Music Paused"
                }
              }).then(() => {
                dispatcher.pause();
              });
            } else if (m.content.startsWith(cserver.prefix + 'resume')) {
              message.channel.send({
                embed: {
                  color: 3447003,
                  description: "▶️ Music Resumed"
                }
              }).then(() => {
                dispatcher.resume();
              });
            } else if (m.content.startsWith(cserver.prefix + 'skip')) {
              message.channel.send({
                embed: {
                  color: 3447003,
                  description: "⏩ Song Skipped!"
                }
              }).then(() => {
                dispatcher.end();
              });
            } else if (m.content.startsWith(cserver.prefix + 'stop')) {
              message.channel.send({
                embed: {
                  color: 10181046,
                  description: "⏹️ Song stopped and Queue cleared"
                }
              }).then(() => {
                // Clear queue
                queue[m.guild.id].songs = [];
                queue[m.guild.id].playing = false;

                // Stop pause
                dispatcher.pause();
                collector.stop();

                // Leave
                commands.leave(m);


              });
            } else if (m.content.startsWith(cserver.prefix + 'volume+')) {
              if (Math.round(dispatcher.volume * 50) >= 100) return message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
              dispatcher.setVolume(Math.min((dispatcher.volume * 50 + (2 * (m.content.split('+').length - 1))) / 50, 2));
              message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
            } else if (m.content.startsWith(cserver.prefix + 'volume-')) {
              if (Math.round(dispatcher.volume * 50) <= 0) return message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
              dispatcher.setVolume(Math.max((dispatcher.volume * 50 - (2 * (m.content.split('-').length - 1))) / 50, 0));
              message.channel.send(`Volume: ${Math.round(dispatcher.volume*50)}%`);
            } else if (m.content.startsWith(cserver.prefix + 'time')) {
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
            playSong(queue[message.guild.id].songs.shift());
          });
          dispatcher.on('error', (err) => {
            return message.channel.send('error: ' + err).then(() => {
              collector.stop();
              playSong(queue[message.guild.id].songs.shift());
            });
          });
        }

      },
      'join': async (message) => {
          const voiceChannel = message.member.voiceChannel;
          if (!voiceChannel || voiceChannel.type !== 'voice') {
            return await message.channel.send({
              embed: {
                color: 10181046,
                description: "⛔ I couldn't connect to your voice channel!"
              }
            });
          }
          await voiceChannel.join().then(connection => resolve(connection)).catch(err => {});
        },
        'leave': async (message) => {
            const voiceChannel = message.member.voiceChannel;
            if (!voiceChannel || voiceChannel.type !== 'voice') {
              return await message.channel.send({
                embed: {
                  color: 10181046,
                  description: "⛔ Not in a voice channel"
                }
              });
            }
            await voiceChannel.leave();
          },
          'add': async (message) => {
              let url = args.join(" ");
              if (url == '' || url === undefined) {
                return await message.channel.send({
                  embed: {
                    color: 10181046,
                    description: `⛔ You must add a YouTube video url, search query, or id after ${cserver.prefix}add`
                  }
                });
              } else if (url.includes('youtube.com')) {
                await yt.getInfo(url, async (err, info) => {
                  if (err) {
                    return await message.channel.send({
                      embed: {
                        color: 10181046,
                        description: '⛔ Invalid youtube link ' + err
                      }
                    });
                  }
                  var livestatus = ''
                  if (info.player_response.videoDetails.isLiveContent === true) {
                    livestatus = "🔴 **LIVE**"
                  }
                  if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
                  queue[message.guild.id].songs.push({
                    url: info.video_url,
                    title: livestatus + '  ' + info.title,
                    requester: message.author.username
                  });
                  message.channel.send({
                    embed: {
                      color: 3447003,
                      author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                      },
                      title: `🎶 added **${info.title}** to the queue`,
                      url: info.video_url,
                      description: `**Length Minutes:** ${(parseInt(info.length_seconds))/60} \n**Keywords:** ${info.keywords.join(", ")} \n\n ${livestatus}`,
                      thumbnail: {
                        url: info.player_response.videoDetails.thumbnail.thumbnails[2].url
                      },
                      timestamp: new Date(),
                      footer: {
                        icon_url: client.user.avatarURL,
                        text: "© " + message.guild
                      }
                    }
                  });
                });
              } else {
                searcher.search(url, {
                    type: 'video'
                  })
                  .then(searchResult => {
                    if (!searchResult.totalResults || searchResult.totalResults === 0) return message.reply("No music found.");
                    var info = searchResult.first;
                    info.title = searchResult.currentPage[0].title;
                    info.requester = message.author.username;
                    if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
                    queue[message.guild.id].songs.push(info);
                    message.channel.send({
                      embed: {
                        color: 3447003,
                        author: {
                          name: client.user.username,
                          icon_url: client.user.avatarURL
                        },
                        title: `🎶 added **${info.title}** to the queue`,
                        url: info.url,
                        description: info.length,
                        thumbnail: {
                          url: searchResult.currentPage[0].thumbnails.medium.url
                        },
                        timestamp: new Date(),
                        footer: {
                          icon_url: client.user.avatarURL,
                          text: "© " + message.guild
                        }
                      }
                    });
                  })
                  .catch();
              }
            },
            'queue': (message) => {
              if (queue[message.guild.id] === undefined) {
                return message.channel.send({
                  embed: {
                    color: 3447003,
                    description: `⛔ Add some songs to the queue first with ${cserver.prefix}play`
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
                  title: `🔀 Music queue for **${message.guild.name}**`,
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
                    description: `${i+1}. 🎵 ${song.title} - Requested by: **${song.requester}**`
                  }
                });
              });
            },
            'reboot': (message) => {
              if (message.author.id == config.adminID) process.exit(); //Requires a node module like Forever to work.
            }
  };

  if (commands.hasOwnProperty(message.content.toLowerCase().slice(cserver.prefix.length).split(' ')[0])) commands[message.content.toLowerCase().slice(cserver.prefix.length).split(' ')[0]](message);
}


module.exports = {
  bot
};