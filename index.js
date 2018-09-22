/*
    The following code goes into it's own file, and you run this file
    instead of your main bot file.
*/
const logo = require('asciiart-logo');
const chalk = require("chalk");
console.log(chalk.keyword('orange')(
    logo({
        name: 'ZORA',
        font: 'Doh',
        lineChars: 15,
        padding: 5,
        margin: 2
    })
    .emptyLine()
    .right('version 0.1.0 beta')
    .emptyLine()
    .wrap('ZoraBOT was created by Avery Wagar and Nathan Laha')
    .render()
));
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./src/index.js');
Manager.spawn(1); // This example will spawn 2 shards (5,000 guilds);

/**
 * Web Interface!
 * Express Server
 */

const express = require('express');
const path = require('path');

const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(50451, () => {
    console.info('Running on port 50451');
});

// Routes
app.use('/api/discord', require('./api/discord'));

app.use((err, req, res, next) => {
    switch (err.message) {
        case 'NoCodeProvided':
            return res.status(400).send({
                status: 'ERROR',
                error: err.message,
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message,
            });
    }
});