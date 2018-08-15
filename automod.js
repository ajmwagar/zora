const config = require('./config.json');
function censor(client, message, command, args){

  config.automod.bannedwords.forEach(() => {

  })
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o => {});

}

module.exports = {censor};
