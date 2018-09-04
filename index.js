/*
    The following code goes into it's own file, and you run this file
    instead of your main bot file.
*/

const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./src/index.js');
Manager.spawn(1); // This example will spawn 2 shards (5,000 guilds);
