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
        https.createServer(options, app).listen(8443);

        passport.use(new OAuth2Strategy({
                authorizationURL: AUTH_URL,
                tokenURL: TOKEN_URL,
                clientID: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                scope: 'guilds',
                callbackURL: "https://dta.dekutree.org:5665/auth/discord/callback"
            },
            function (accessToken, refreshToken, profile, cb) {
                User.findOrCreate({
                    exampleId: profile.id
                }, function (err, user) {
                    return cb(err, user);
                });
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
    checkToken(_token) {
        return (_token == this.token)
    }

    /**
     * Register root pathes
     */
    registerRoots() {
        this.app.get('/', (req, res) => {
            var _token = req.query.token
            if (!this.checkToken(_token)) {
                // Render error view if token does not pass
                res.render('error', {
                    title: "ERROR"
                })
                return
            }

            // Collect all text channels and put them into an
            // array as object { id, name }
            var chans = []
            this.client.guilds.first().channels
                .filter(c => c.type == 'text')
                .forEach(c => {
                    chans.push({
                        id: c.id,
                        name: c.name
                    })
                })

            // Render index view and pass title, token
            // and channels array
            res.render('index', {
                title: "ZoraBOT Web Interface",
                token: _token,
                chans
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
                console.log('got callback')
                // Successful authentication, redirect home.
                res.redirect('/');
            });

        this.app.post('/sendMessage', (req, res) => {
            var _token = req.body.token
            var channelid = req.body.channelid
            var text = req.body.text

            if (!_token || !channelid || !text)
                return res.sendStatus(400);

            if (!this.checkToken(_token))
                return res.sendStatus(401)

            var chan = this.client.guilds.first().channels.get(channelid)

            // catch post request and if token passes,
            // send message into selected channel
            if (chan) {
                chan.send(text)
                res.sendStatus(200)
            } else
                res.sendStatus(406)
        })
    }

}

module.exports = WebSocket