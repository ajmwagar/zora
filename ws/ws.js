const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require("body-parser");
const path = require('path')
const chalk = require('chalk')
const https = require('https');
const querystring = require('querystring');
const URL = require('url');
const OAuth2Strategy = require('passport-discord-oauth2').Strategy;
const passport = require('passport');
const fs = require('fs');
const axios = require('axios');
const database = require('../src/index.js');
const mongoose = require('mongoose'),
    UserM = require('../src/index.js').UserM,
    ServerM = require('../src/index.js').ServerM;

const {
    catchAsync
} = require('../utils');
const config = require("../config.json");

/**
 * Websocket class.
 * @param {string}         token  Token to authenticate at the web interface
 * @param {number}         port   Port to access web interface
 * @param {discord.Client} client Discord client instance to access the discord bot
 */

const CLIENT_ID = config.ws.clientid;
const CLIENT_SECRET = config.ws.clientsecret;
const AUTH_URL = config.ws.authurl;
const TOKEN_URL = config.ws.tokenurl;

var _token;
var oservers = [];
var ousername = '';

class WebSocket {

    constructor(token, port, client) {
        this.token = token
        this.port = port
        this.client = client
        this.app = express()
        this.app.use(require('cookie-parser')());
        this.app.use(require('body-parser').urlencoded({
            extended: true
        }));
        this.app.use(require('express-session')({
            secret: 'zorabot2345555',
            resave: true,
            saveUninitialized: true
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        // Register Handlebars instance as view engine
        this.app.engine('hbs', hbs({
            extname: 'hbs', // Extension (*.hbs Files)
            defaultLayout: 'layout', // Main layout -> layouts/layout.hbs
            layoutsDir: __dirname + '/layouts', // Layouts directory -> layouts/
            helpers: {
                username: function () {
                    return 'Cannot get username!';
                },
                servers: function () {
                    return 'Cannot get servers!';
                }
            }
        }))

        // Set folder views/ as location for views files
        this.app.set('views', path.join(__dirname, 'views'))
        // Set hbs as view engine
        this.app.set('view engine', 'hbs')
        // Set public/ as public files root
        this.app.use(express.static(path.join(__dirname, 'public')))
        // Register bodyParser as parser for Post requests body in JSON-format
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));
        this.app.use(bodyParser.json());

        this.registerRoots()

        // Start websocket on port defined in constructors arguments

        // SSL Certs
        // TODO move into config.json
        const options = {
            cert: fs.readFileSync('./sslcert/fullchain.pem'),
            key: fs.readFileSync('./sslcert/privkey.pem')
        };
        // URL that points to MongoDB database
        var url = "mongodb://localhost:27017/zora";

        // Connect/Create MongoDB database
        mongoose.connect(url, {
            user: config.databaseuser,
            pass: config.databasepass
        });

        this.server = this.app.listen(port, () => {
            console.log(chalk.bgGreen("HTTP server set up at port " + this.server.address().port))
        })
        https.createServer(options, this.app).listen(443);
        console.log(chalk.bgGreen("HTTPS server set up at port 443"))

        passport.use(new OAuth2Strategy({
                authorizationURL: AUTH_URL,
                tokenURL: TOKEN_URL,
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                scope: 'identify guilds',
                callbackURL: "https://dta.dekutree.org/auth/discord/callback"
            },
            function (accessToken, refreshToken, profile, cb) {
                _token = accessToken;
                axios.get('https://discordapp.com/api/users/@me', {
                        headers: {
                            'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
                            Authorization: 'Bearer ' + _token
                        }
                    })
                    .then(function (response) {
                        ousername = response.data.username
                        axios.get('https://discordapp.com/api/users/@me/guilds', {
                                headers: {
                                    'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
                                    Authorization: 'Bearer ' + _token
                                }
                            })
                            .then(function (response2) {
                                for (var oguild in response2.data) {
                                    if (response2.data[oguild].owner == true) {
                                        oservers.push(response2.data[oguild]);
                                    }
                                }
                                return cb();
                            })
                            .catch(function (error) {
                                console.log(error);
                            })
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            }
        ));
        console.log(chalk.bgGreen("Discord OAUTH2 Online!"));
    }

    checkToken(token) {
        return (token == this._token)
    }
    /**
     * Register root pathes
     */
    registerRoots() {
        this.app.get('/health-check', (req, res) => res.sendStatus(200));

        this.app.get('/auth/discord',
            passport.authenticate('discord', {
                display: 'popup'
            }));

        this.app.get('/auth/discord/callback',
            passport.authenticate('discord', {
                successRedirect: '/dashboard',
                failureRedirect: '/dashboard'
            }),
            function (req, res) {
                // Successful authentication, redirect home.
                res.redirect('/dashboard');
            });

        this.app.get('/dashboard', (req, res) => {
            res.render('dashboard', {
                username: ousername,
                token: _token,
                servers: oservers
            })
        })

        this.app.post('/setServer', (req, res) => {
            var token = req.body.token
            var serverid = req.body.serverid

            if (!token || !servername)
                return res.sendStatus(400);

            if (!this.checkToken(token))
                return res.sendStatus(401)

            console.log('SEVER SELECTED:' + serverid)
            res.sendStatus(200);
        })
    }

}

module.exports = WebSocket