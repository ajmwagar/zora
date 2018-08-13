git pull

docker build -t discord/bot .

docker stop SeaBot
docker rm SeaBot

docker run --name SeaBot -d discord/bot

docker ps
