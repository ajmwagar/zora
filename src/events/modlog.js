function modlog(client, config){

// Modlog
const fire = (text, guild) => {
  if (!guild.channels) return

  // TODO Server set modlog channel
  let channel = guild.channels.find(c => c.name && c.name.includes(config.serverconfigs[guild.id].modlogChannel));

  if (!channel) {
    console.log("Channel not found");
    return;
  }

  let time = `**\`[${moment().format("M/D/YY - hh:mm")}]\`** `
  channel.send(time + text, {
    split: true
  }).then().catch(console.log);
}

client.on('messageDelete', msg => {
  if (msg.channel.type !== "text") return
  if (msg.channel.name && msg.channel.name.includes(config.serverconfigs[guild.id].modlogChannel)) return;
  fire(`**#${msg.channel.name} | ${msg.author.tag}'s message was deleted:** \`${msg.content}\``, msg.guild)
})

client.on('messageUpdate', (msg, newMsg) => {
  if (msg.content === newMsg.content) return
  fire(`**#${msg.channel.name} | ${msg.author.tag} edited their message:**\n**before:** \`${msg.content}\`\n**+after:** \`${newMsg.content}\``, msg.guild)
})

client.on('guildMemberUpdate', (old, nw) => {
  let txt
  if (old.roles.size !== nw.roles.size) {
    if (old.roles.size > nw.roles.size) {
      //Taken
      let dif = old.roles.filter(r => !nw.roles.has(r.id)).first()
      txt = `**${nw.user.tag} | Role taken -> \`${dif.name}\`**`
    } else if (old.roles.size < nw.roles.size) {
      //Given
      let dif = nw.roles.filter(r => !old.roles.has(r.id)).first()
      txt = `**${nw.user.tag} | Role given -> \`${dif.name}\`**`
    }
  } else if (old.nickname !== nw.nickname) {
    txt = `**${nw.user.tag} | Changed their nickname to -> \`${nw.nickname}\`**`
  } else return
  fire(txt, nw.guild)
})

client.on('roleCreate', (role) => {
  fire("**New role created**", role.guild)
})

client.on('roleDelete', (role) => {
  fire("**Role deleted -> `" + role.name + "`**", role.guild)
})

client.on('roleUpdate', (old, nw) => {
  let txt
  if (old.name !== nw.name) {
    txt = `**${old.name} | Role name updated to -> \`${nw.name}\`**`
  } else return
  fire(txt, nw.guild)
})

client.on('guildBanAdd', (guild, user) => {
  fire(`**User banned -> \`${user.tag}\`**`, guild)
})

client.on('guildBanRemove', (guild, user) => {
  fire(`**User unbanned -> \`${user.tag}\`**`, guild)
})

}

module.exports = modlog;
