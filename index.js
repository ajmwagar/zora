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
const https = require('https');
const fs = require('fs');
const app = express();
const bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, 'static')))

// Register bodyParser as parser for Post requests body in JSON-format
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// SSL Certs
// TODO move into config.json
const options = {
    cert: fs.readFileSync('./sslcert/fullchain.pem'),
    key: fs.readFileSync('./sslcert/privkey.pem')
};

app.listen(80, () => {
    console.info('Running on port 80');
});
var server = https.createServer(options, app).listen(443);
var io = require('socket.io')(server);
console.log(chalk.bgGreen("HTTPS server set up at port 443"))

app.use(express.static('public'))

app.get('/api/discord/login', function (req, res) {
    res.redirect('https://discordapp.com/api/oauth2/authorize?client_id=478616471640080395&redirect_uri=https%3A%2F%2Fdta.dekutree.org%2F%23%2Fdashboard&response_type=code&scope=identify%20guilds')
})

io.on('connection', function (socket) {
    console.log(chalk.bgBlue('Dashboard User Connected'));
    socket.on('disconnect', function () {
        console.log(chalk.bgBlue('Dashboard User Disconnected'));
    });
});