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
            layoutsDir: __dirname + '/layouts' // Layouts directory -> layouts/
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
        const options = {
            cert: fs.readFileSync('./sslcert/fullchain.pem'),
            key: fs.readFileSync('./sslcert/privkey.pem')
        };
        this.server = this.app.listen(port, () => {
            console.log(chalk.bgGreen("Websocket API set up at port " + this.server.address().port))
        })
        https.createServer(options, this.app).listen(443);

        passport.use(new OAuth2Strategy({
                authorizationURL: AUTH_URL,
                tokenURL: TOKEN_URL,
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                scope: 'identify',
                callbackURL: "https://dta.dekutree.org/auth/discord/callback"
            },
            function (accessToken, refreshToken, profile, cb) {
                console.log(accessToken)
                _token = accessToken;
                //Get userid
                axios.get('https://discordapp.com/api/users/@me', {
                        headers: {
                            'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
                            Authorization: 'Bearer ' + _token
                        }
                    })
                    .then(function (response) {
                        console.log(response.data.id);

                    })
                    .catch(function (error) {
                        console.log(error);
                    })

            }
        ));
        console.log(chalk.bgGreen("Discord OAUTH2 Online!"));
    }

    /**
     * Compare passed token with the token defined on
     * initialization of the websocket
     * @param {string} _token Token from request parameter 
     * @returns {boolean} True if token is the same
     */

    /**
     * Register root pathes
     */
    registerRoots() {
        this.app.get('/', (req, res) => {
            // Render index view and pass title, token
            // and channels array
            res.render('index', {
                title: "ZoraBOT Web Interface"
            })
        })

        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function (id, done) {
            User.findById(id, function (err, user) {
                done(err, user);
            });
        });

        this.app.get('/health-check', (req, res) => res.sendStatus(200));

        this.app.get('/auth/discord',
            passport.authenticate('discord'));

        this.app.get('/auth/discord/callback',
            passport.authenticate('discord', {
                failureRedirect: '/auth/discord'
            }),
            function (req, res) {
                // Successful authentication, redirect home.
                res.redirect('/');
            });


        this.app.get('/dashboard', (req, res) => {

        })
    }

}

module.exports = WebSocket