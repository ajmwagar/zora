# discordbot
## Have you ever wanted your server's own discord bot?

Now, you can! 


## Features:

- Music
  - Youtube links
  - Searching youtube
  - Queuing songs
  - Skip, Pause, Resume, and Stop commands
- Meme dumper from Reddit
  - Server specific subreddits
- Weather command
- Joke command
- Yodaspeak translator
- Custom server settings
  - Custom prefix
  - Custom automod
  - Custom name
- Admin commands
  - Kick
  - Ban
  - Purge
  - Say


## Installation: 

1. Clone the repository 

```bash
git clone https://github.com/ajmwagar/discordbot
```
2. Enter the repository

```bash
cd discordbot
```
2. Install dependences

```bash
npm install
```
3. Edit config.json (add ytsearch key, discord bot key, and set default prefix)

```bash
$EDITOR config.json
```
4. Profit!

```bash
node index.js
```

OR 

```
pm2 start index.js -n <botname>
```

## Acknowledgements: 
This bot would not be possible without:
- Nathan Laha (@TheDekuTree) http://www.averywagar.com/
- Avery Wagar (@ajmwagar) https://nlaha.com/
