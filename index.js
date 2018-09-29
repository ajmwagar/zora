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
var url = require('url');
const config = require("./config.json");
var ClientOAuth2 = require('client-oauth2')
const axios = require('axios');

var discordAuth = new ClientOAuth2({
    clientId: config.ws.clientid,
    clientSecret: config.ws.clientsecret,
    accessTokenUri: config.ws.tokenurl,
    authorizationUri: config.ws.authurl,
    redirectUri: 'https://dta.dekutree.org/api/discord/callback',
    scopes: ['identify', 'guilds']
})

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
    var uri = discordAuth.code.getUri()
    res.redirect(uri)
})

app.get('/api/discord/callback', function (req, res) {
    discordAuth.state =
        discordAuth.code.getToken(req.originalUrl)
        .then(function (user) {

            // Refresh the current users access token.
            user.refresh().then(function (updatedUser) {})

            // Sign API requests on behalf of the current user.
            user.sign({
                method: 'get',
                url: 'https://dta.dekutree.org'
            })

            return res.redirect(`/#/dashboard?token=${user.accessToken}`)

        })
})


io.on('connection', function (socket) {
    console.log(chalk.bgBlue('Dashboard User Connected'));
    socket.on('disconnect', function () {
        console.log(chalk.bgBlue('Dashboard User Disconnected'));
    });
    socket.on('getServers', function (token) {
        console.log(token);
        axios
            .get("https://discordapp.com/api/users/@me/guilds", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'User-Agent': 'DiscordBot (https://github.com/ajmwagar/zora, 0.1)'
                }
            })
            .then(function (response) {
                let ownedservers = [];
                response.data.forEach(function (server) {
                    if (server.owner == true) {
                        ownedservers.push(server);
                    }
                });
                socket.emit('updateServers', ownedservers, function (answer) {

                });
                console.log(ownedservers);
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    });
});