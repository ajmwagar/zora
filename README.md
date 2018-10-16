![Zora](https://i.imgur.com/u3xOYSz.png)
# Zora 
[![Discord Bots](https://discordbots.org/api/widget/status/478616471640080395.svg)](https://discordbots.org/bot/478616471640080395)
![Deps](https://david-dm.org/ajmwagar/zora.svg)
[![HitCount](http://hits.dwyl.io/ajmwagar/zora.svg)](http://hits.dwyl.io/ajmwagar/zora)
[![Discord](https://img.shields.io/badge/discord-server-%239d89d6.svg)](https://discord.gg/rRt5AHQ)


## A modular discord bot that is fully customizable!

## Features:
- Compatible with ZoraWeb a customizable dashboard made in Vue!
- Music
  - Youtube links
  - Searching youtube
  - Queuing songs
  - Skip, Pause, Resume, and Stop commands
  - Soundcloud
- Meme dumper from Reddit
  - Server specific subreddits
- Stack Overflow Search
- Weather command
- Wolfram Alpha Search
- Modlog
  - Various actions
  - Image archive with AI autotagger
- Joke command
- Yodaspeak translator
- Google Translate
- Currency Converter with Crypto Support
- Economy commands
  - Forbes (Richest people list)
  - Shop
  - Daily rewards
  - Slots
- Levels and XP
  - Promote server engagement.
- Custom server settings
  - Custom prefix
  - Custom automod
  - Custom name
- Auto-sharding
- Admin commands
  - Kick
  - Ban
  - Purge
  - Say

## Installation (Invite Zora)

Zora is the official bot hosted by the creators of this repo, 
you can invite it to your discord server by clicking the link below:
[INVITE Zora](https://discordapp.com/api/oauth2/authorize?client_id=478616471640080395&permissions=8&scope=bot)

## Installation (Host your own bot): 

### 1. Clone the repository 

```bash
git clone https://github.com/ajmwagar/zora
```
### 2. Enter the repository

```bash
cd zora
```
### 3. Install dependences

```bash
npm install
```
### 4. Setup MongoDB 

Install a MongoDB server with a database called `zora`

Make sure it's on a server that can handle it! Each user and server will have their own document!

### 5. Create and Edit config.json (add ytsearch key, discord bot key)
```bash
$EDITOR config.json
```
  Add the following to config.json 
```json
{
    "token": "my discord bot token",
    "youtubeKey": "my youtube data api key",
    "databaseuser": "my mongodb username",
    "databasepass": "my mongodb password",
    "wolfram": "my wolframalpha key",
    "ws": {
        "clientid": "my discord client id",
        "clientsecret": "my discord client secret",
        "authurl": "https://discordapp.com/api/oauth2/authorize",
        "tokenurl": "https://discordapp.com/api/oauth2/token"
    }
}
```

### 6. Profit!

```bash
node index.js
```

## OR 

```
pm2 start index.js -n <botname>
```

## Acknowledgements: 
This bot would not be possible without:
- Nathan Laha (DekuTree#0460) https://nlaha.com/
- Avery Wagar (@ajmwagar) http://www.averywagar.com/
