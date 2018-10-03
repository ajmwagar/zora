const schedule = require('node-schedule');

async function bot(client, message, command, args, defaultConfig, defaultprofile, cuser, cserver, UserM, ServerM) {

    /**
     ** Start the main loop, this runs every hour
     ** used to update things such as stats 
     */

    async function update() {
        // Get from database and sort!
        const getSort = () => {
            return UserM.find({}).sort({
                zcoins: -1
            }).exec()
        }

        var sorted = await getSort();

        // Default to 100
        var top = 25;

        // Add fields
        var counter = 1;
        for (var usr in sorted) {
            var profile = sorted[counter - 1];
            if (profile) {
                if (counter <= top && counter <= 25) {
                    if (counter === 1) {
                        client.guilds.forEach(async function (guild) {
                            await ServerM.findById(guild.id, function (err, server) {
                                console.log('Update Data: ' + guild.id)
                                server.stats.richest.id = profile._id;
                                server.stats.richest.name = profile.username;
                                server.stats.richest.zcoins = profile.zcoins;
                                server.stats.richest.level = profile.level;
                                server.save();
                            });
                        });
                    }
                }
            }
        }
    }

    update();
    var j = schedule.scheduleJob('0 * * * *', async function () {
        update();
    });
}

module.exports = {
    bot
};