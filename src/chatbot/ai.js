const brain = require('brain.js');
const Discord = require("discord.js");
const fs = require('fs');
const chalk = require('chalk');
const _cliProgress = require('cli-progress');
const {
    chain
} = require('stream-chain');
const {
    parser
} = require('stream-json');
const {
    streamArray
} = require('stream-json/streamers/StreamArray');
const path = require('path');

var filename = path.join(__dirname, 'data/questionset.json');

const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

var trainingdata = [];
var run;
var datacycles = 100;
var errorlevel = 0.013;
var iterationcap = 15000;

var limiteddata = [];

async function bot(client, message, command, args, cuser, cserver, UserM, ServerM) {
    if (command === "ztrain") {
        if (message.author.id == "205419165366878211" || message.author.id == "226021264018374656") {
            /**
             * * Dataset Processing
             */
            if (args[0]) {
                errorlevel = args[0];
            }
            if (args[1]) {
                datacycles = args[1];
            }

            const pipeline = chain([
                fs.createReadStream(filename),
                parser(),
                streamArray()
            ]);
            console.log('Reading Dataset')
            message.channel.send('Reading Dataset...')
            bar1.start(435, 0);

            pipeline.on('data', function (index, value) {
                if (!index.value.paragraphs[0].qas[0].answers.length == 0) {
                    trainingdata.push({
                        input: index.value.paragraphs[0].qas[0].question,
                        output: index.value.paragraphs[0].qas[0].answers[0].text
                    });
                    bar1.increment();
                }
            });

            pipeline.on('end', async function () {
                bar1.stop();
                console.log('DONE READING')
                console.log(trainingdata)
                // All lines are read, file is closed now.
                /**
                 * * Neural Net
                 */
                const lstm = new brain.recurrent.LSTM();
                const m = await message.channel.send(`**Training: ${errorlevel} | ${datacycles}** Please wait, this could take a while!`);

                for (i = 0; i < datacycles; i++) {
                    limiteddata.push(trainingdata[Math.floor(Math.random() * trainingdata.length)], trainingdata[Math.floor(Math.random() * trainingdata.length)], trainingdata[Math.floor(Math.random() * trainingdata.length)])
                    console.log(chalk.green('Added pair to training'))
                }
                const result = lstm.train(limiteddata, {
                    iterations: iterationcap,
                    log: function (details) {
                        console.log(details)
                    },
                    logPeriod: 1,
                    learningRate: 0.3,
                    errorThresh: errorlevel
                });
                const result01 = lstm.run('I know the answer.');
                const result00 = lstm.run('What happened!');
                const result11 = lstm.run('Hello, what is your name?');
                const result10 = lstm.run('Hello, my name is Nathan.');

                console.log('RUN 1: ' + result01);
                console.log('RUN 2: ' + result00);
                console.log('RUN 3: ' + result11);
                console.log('RUN 4: ' + result10);
                run = lstm.toFunction();
                console.log('Saved Net');
                m.edit(`Training done! Type **${cserver.prefix}ztalk <message>**`)
            });
        } else {
            return message.reply("Sorry, you don't have permissions to use this!");
        }
    } else if (command === "ztalk") {
        if (message.author.id == "205419165366878211" || message.author.id == "226021264018374656") {
            text = args.join(" ")
            message.reply(run(text));
        } else {
            return message.reply("Sorry, you don't have permissions to use this!");
        }
    }
}

module.exports = {
    bot
};