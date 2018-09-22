const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
const config = require("../config.json");
const {
    catchAsync
} = require('../utils');

const router = express.Router();

const CLIENT_ID = config.ws.clientid;
const CLIENT_SECRET = config.ws.clientsecret;
const redirect = encodeURIComponent('https://localhost/auth/discord/callback');

router.get('/auth/discord', (req, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&scope=identify&response_type=code&scope=guilds`);
});

router.get('/auth/discord/callback', catchAsync(async (req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${creds}`,
        },
    });
    const json = await response.json();
    res.redirect(`/?token=${json.access_token}`);
}));

module.exports = router;