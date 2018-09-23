const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
const axios = require('axios');
const config = require("../config.json");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// URL that points to MongoDB database
var url = "mongodb://localhost:27017/zora";

mongoose.connect(url, {
  user: config.databaseuser,
  pass: config.databasepass
});
const {
  catchAsync
} = require('../utils');

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

async function setServerConfig(id, newconfig) {
  await ServerM.findById(id, function (err, server) {
    server = newconfig;
    server.save();
  });
  return;
}

const router = express.Router();

const CLIENT_ID = config.ws.clientid;
const CLIENT_SECRET = config.ws.clientsecret;
const redirect = encodeURIComponent('https://dta.dekutree.org/api/discord/callback');

router.get('/login', (req, res) => {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&scope=identify%20guilds&response_type=code`);
});

/**
 * Get guilds that the user owns using the
 * discord api with our new Token
 */
router.get('/dashboard', (req, res) => {
  let ousername;
  let oservers = [];
  let _token = req.query.token;
  axios.get('https://discordapp.com/api/users/@me', {
      headers: {
        'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
        Authorization: 'Bearer ' + _token
      }
    })
    .then(function (response) {
      ousername = response.data.username;
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
          res.render('dashboard', {
            username: ousername,
            servers: oservers,
            token: _token
          })
        })
        .catch(function (error) {
          res.redirect('/api/discord/login');
        })
    })
    .catch(function (error) {
      res.redirect('/api/discord/login');
    })
});

router.post('/setServer', async function (req, res) {
  var token2 = req.query.token
  var serverid = req.body.serverid
  var prefix = req.body.prefix
  var servers = req.body.servers
  var serversids = [];
  for (var server in servers) {
    serversids.push(server.id);
  }

  if (!token2 || !serverid || !prefix)
    return res.sendStatus(400);

  axios.get('https://discordapp.com/api/users/@me/guilds', {
      headers: {
        'user-agent': "DiscordBot (https://github.com/ajmwagar/zora, 0.1)",
        Authorization: 'Bearer ' + token2
      }
    })
    .then(async function (response) {
      for (var oguild in response.data) {
        if (response.data[oguild].owner == true) {
          if (serversids.includes(response.data[oguild].id)) {
            cdserver = await getServerConfig(serverid);
            cdserver.prefix = prefix;
            await setServerConfig(serverid, cdserver)
            res.redirect(200, 'dashboard');
          }
        }
      }
    })
    .catch(function (error) {
      console.log(error);
      return res.sendStatus(401)
    })

})

/**
 * Redirect to Dashboard and put token in url query
 */
router.get('/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
    },
  });
  const json = await response.json();
  res.redirect(`/api/discord/dashboard?token=${json.access_token}`);
}));

module.exports = router;