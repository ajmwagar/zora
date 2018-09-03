const config = require('../config.json');

function censor(message) {
  config.serverconfigs[message.guild.id].automod.bannedwords.forEach((word) => {
    if (message.content.includes(word)) {
      message.reply("Watch your mouth.\nYour message has been removed for profanity.")
      // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
      message.delete().catch(O_o => {});
    }
  })

}

module.exports = {
  censor
};
