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
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// URL that points to MongoDB database
var url = "mongodb://localhost:27017/zora";

// Connect/Create MongoDB database
mongoose.connect(url, {
    user: config.databaseuser,
    pass: config.databasepass
});
console.log(chalk.green('connected web interface to database'));

// Default server configuration (also used with .clearcfg)
var defaultConfig = new Schema({
    name: {
        type: String,
        default: ''
    },
    _id: Schema.Types.Decimal128,
    prefix: {
        type: String,
        default: "+"
    },
    modlogChannel: {
        type: String,
        default: "modlog"
    },
    welcomes: {
        type: Boolean,
        default: false
    },
    modules: {
        music: {
            type: Boolean,
            default: true
        },
        gamestats: {
            type: Boolean,
            default: true
        },
        modlog: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        users: {
            type: Number,
            default: 0
        },
        richest: {
            id: Schema.Types.Decimal128,
            name: {
                type: String,
                default: ''
            },
            zcoins: {
                type: Number,
                default: 0
            }
        }
    },
    premium: {
        type: Boolean,
        default: false
    },
    reddit: {
        subreddits: [],
        posts: {
            type: String,
            default: 3
        },
        channel: {
            type: String,
            default: "memes"
        },
        interval: {
            type: Number,
            default: 1
        }
    },
    automod: {
        bannedwords: []
    }
});

// Default user profile config
var defaultprofile = new Schema({
    level: {
        type: Number,
        default: "1"
    },
    username: String,
    xp: {
        type: Number,
        default: "0"
    },
    zcoins: {
        type: Number,
        default: "100"
    },
    VIP: {
        type: Boolean,
        default: false
    },
    inventory: [],
    _id: Schema.Types.Decimal128
});

// Define models
const UserM = mongoose.model("Users", defaultprofile);
const ServerM = mongoose.model("Servers", defaultConfig);

async function getServerConfig(id) {
    var outserver;
    await ServerM.findById(id, function (err, server) {
        outserver = server;
    });
    return outserver;
}

// Write a config object to the database
async function setServerConfig(id, newconfig) {
    await ServerM.findById(id, function (err, server) {
        server.prefix = newconfig.prefix;
        server.modlogChannel = newconfig.modlogChannel;
        server.welcomes = newconfig.welcomes;
        server.modules.music = newconfig.modules.music;
        server.modules.modlog = newconfig.modules.modlog;
        server.modules.gamestats = newconfig.modules.gamestats;
        console.log('Write Database');
        server.save();
    });
    return;
}

// Set up OAuth
var discordAuth = new ClientOAuth2({
    clientId: config.ws.clientid,
    clientSecret: config.ws.clientsecret,
    accessTokenUri: config.ws.tokenurl,
    authorizationUri: config.ws.authurl,
    redirectUri: 'https://dta.dekutree.org/api/discord/callback',
    scopes: ['identify', 'guilds']
})

var discordAuthChrome = new ClientOAuth2({
    clientId: config.ws.clientid,
    clientSecret: config.ws.clientsecret,
    accessTokenUri: config.ws.tokenurl,
    authorizationUri: config.ws.authurl,
    redirectUri: 'https://dta.dekutree.org/api/discord/callbackchrome',
    scopes: ['identify', 'guilds']
})

// Serve static files
app.use(express.static(path.join(__dirname, 'static')))

// Register bodyParser as parser for Post requests body in JSON-format
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// SSL Certs and HTTPS server
// TODO move into config.json
if (fs.existsSync('./sslcert/fullchain.pem') && fs.existsSync('./sslcert/privkey.pem')) {
    const options = {
        cert: fs.readFileSync('./sslcert/fullchain.pem'),
        key: fs.readFileSync('./sslcert/privkey.pem')
    };
    var server = https.createServer(options, app).listen(443);
} else {
    var server = https.createServer(app).listen(443);
}

// HTTP server
app.listen(80, () => {
    console.info(chalk.green('HTTP server set up at port 80'));
});

// Set up socket.io
var io = require('socket.io')(server);
console.log(chalk.green("HTTPS server set up at port 443"))

// Serve static files
app.use(express.static('public'))

// This page points to the discord authorization page
app.get('/api/discord/login', function (req, res) {
    var uri = discordAuth.code.getUri()
    res.redirect(uri)
})

// This is used to get the token for the chrome extension
app.get('/api/discord/loginchrome', function (req, res) {
    var uri = discordAuth.code.getUri()
    res.redirect(uri)
})

// Callback for discord OAuth
app.get('/api/discord/callback', function (req, res) {
    discordAuth.state =
        discordAuth.code.getToken(req.originalUrl)
        .then(function (user) {

            user.expiresIn(124241);

            // Sign API requests on behalf of the current user.
            user.sign({
                method: 'get',
                url: 'https://dta.dekutree.org'
            })

            console.log('OAUTH2 Redirected!')
            return res.redirect(`https://zora.netlify.com/#/dashboard?token=${user.accessToken}`)

        })
})

// Callback for chrome extension
app.get('/api/discord/callbackchrome', function (req, res) {
    discordAuth.state =
        discordAuth.code.getToken(req.originalUrl)
        .then(function (user) {

            user.expiresIn(124241);

            // Sign API requests on behalf of the current user.
            user.sign({
                method: 'get',
                url: 'https://dta.dekutree.org'
            })

            console.log('OAUTH2 Redirected!')
            return res.send(user.accessToken);

        })
})

// Called when someone successfully logs into the dashboard
io.on('connection', function (socket) {
    console.log(chalk.cyan('Dashboard User Connected'));
    socket.on('disconnect', function () {
        console.log(chalk.cyan('Dashboard User Disconnected'));
    });

    socket.on('playVideo', function (token, url) {
        axios.get('https://discordapp.com/api/users/@me', {
                headers: {
                    'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
                    Authorization: `Bearer ${token}`
                }
            })
            .then(function (response) {
                console.log(response.data.id)
                Manager.shards[0].broadcastEval(`playVideo(${response.data.id}, ${url})`).then(console.log);
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    });

    socket.on('getServers', function (token) {
        axios.get('https://discordapp.com/api/users/@me/guilds', {
                headers: {
                    'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
                    Authorization: `Bearer ${token}`
                }
            })
            .then(function (response) {
                let ownedservers = [];
                response.data.forEach(function (server) {
                    if (server.owner == true) {
                        ownedservers.push(server);
                    }
                });
                socket.emit('updateServers', ownedservers, function (answer) {});
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    });
    socket.on('getChannels', async function (token, serverid) {

        //! :WARNING: THIS IS COMPLETELY UNSECURE! Due to rate limiting restrictions, anyone can view the config of a server!

        //! This function could be executed by anyone!

        let updatedvalues = {};

        // get current config for server from database
        cdserver = await getServerConfig(serverid);

        // update variables based on database
        updatedvalues.prefix = cdserver.prefix;
        updatedvalues.channel = cdserver.modlogChannel;
        updatedvalues.welcomestate = cdserver.welcomes;
        updatedvalues.playercount = cdserver.stats.users;
        updatedvalues.musicstate = cdserver.modules.music;
        updatedvalues.modlogstate = cdserver.modules.modlog;
        updatedvalues.gamestats = cdserver.modules.gamestats;
        if (cdserver.stats.richest.name && cdserver.stats.richest.zcoins && cdserver.stats.richest.level) {
            updatedvalues.richestPerson.name = cdserver.stats.richest.name;
            updatedvalues.richestPerson.zcoins = cdserver.stats.richest.zcoins;
            updatedvalues.richestPerson.level = cdserver.stats.richest.level;
        }
        socket.emit('updateValues', updatedvalues);

    });
    socket.on('SaveCFG', function (token, serverid, newconfiguration) {
        /**
         * Always make sure the token submitted by the client
         * has access to the server you are modifying
         */
        axios.get('https://discordapp.com/api/users/@me/guilds', {
                headers: {
                    'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
                    Authorization: `Bearer ${token}`
                }
            })
            .then(async function (response) {
                let ownedservers = [];
                let ownsserver = false;

                response.data.forEach(function (server) {
                    if (server.owner == true) {
                        ownedservers.push(server);
                        if (server.id == serverid) {
                            ownsserver = true;
                        }
                    }
                });

                if (ownsserver == true) {
                    /**
                     *  If the client is authorized to modify settings for this server
                     *  set the current values
                     * */

                    var newconfig = {};

                    newconfig = newconfiguration;

                    // set current config for server in database
                    await setServerConfig(serverid, newconfig);
                }
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () {
                // always executed
            });
    });
});