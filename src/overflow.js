const axios = require('axios');
const config = require('../config.json');
const Discord = require("discord.js");
const decodeString = require("unescape");

async function bot(client, message, command, args) {
  if (command === "stack") {
    var stackapi = axios.create({
      baseURL: 'https://api.stackexchange.com/'
    })

    if (args.length > 0) {

      var m = await message.channel.send("Taking the AP Exam...");

      stackapi.get(`/2.2/similar`, {
        params: {
          key: config.stackkey,
          title: args.join(" "),
          order: "desc",
          sort: "relevance",
          site: "stackoverflow",
          filter: "!9Z(-wtr.v"
        }
      }).then((res) => {
        var qs = res.data.items;

        var first = findFirstAnwser(qs);

        var question, answer;

        if (first && first.question_id) {

          stackapi.get(`/2.2/posts/${first.question_id}`, {
            params: {
              key: config.stackkey,
              order: "desc",
              sort: "votes",
              site: "stackoverflow",
              filter: "!-*jbN*x3a8Sb"
            }
          }).then((res) => {
            if (res.data.items[0].body_markdown.length < 2000) {


              question = res.data.items[0];

            } else {
              m.edit("Question too long for discord. " + res.data.items[0].link)
            }
          }).catch((err) => {
            console.error("Qeuestion: " + err.data)
          })

          stackapi.get(`/2.2/questions/${first.question_id}/answers`, {
            params: {
              key: config.stackkey,
              order: "desc",
              sort: "votes",
              site: "stackoverflow",
              filter: "!9Z(-wtr.v"
            }
          }).then(async (res) => {
            let tempanswer = await getAcceptedOrHighest(res.data.items);

            stackapi.get(`/2.2/answers/${tempanswer.answer_id}`, {
              params: {
                key: config.stackkey,
                order: "desc",
                sort: "votes",
                site: "stackoverflow",
                filter: "!9Z(-wzftf"
              }
            }).then(async (res) => {
              // TODO Pretty print it all
              answer = res.data.items[0];
              // check if answer is too long
              if (decodeString(answer.body_markdown).length >= (1023 - question.link.length)) {
                message.channel.send(`Answer too long for discord. ${question.link}`);
              }
              //generate rich embed
              let embed = new Discord.RichEmbed()
                .setTitle(question.title)
                .setAuthor(client.user.username + " - Source: StackOverflow", client.user.avatarURL)
                .setColor(0xff5323)
                .setDescription(await decodeString(question.body_markdown).substring(0, 1023 - question.link.length))
                .setFooter("©" + message.guild, client.user.avatarURL)
                .setThumbnail('https://i.imgur.com/Qn14Fvr.png')
                .setTimestamp()
                .setURL(question.link)
                .addBlankField(true)
                .addField("Best Answer", await decodeString(answer.body_markdown).substring(0, 1023 - question.link.length))
              // send the embed
              m.edit({
                embed
              });
            }).catch((err) => {
              console.error(err)
            })
          }).catch((err) => {
            console.error(err)
          })
        } else {
          m.edit("Search terms not specific enough");
        }


      }).catch(console.error);

    } else {
      message.channel.send("Please enter search terms.");
    }

  }
}

module.exports = {
  bot
};

function findFirstAnwser(q) {
  for (var i = 0; i < q.length; i++) {
    if (q[i].is_answered == true)
      return q[i];
  }
}

async function getAcceptedOrHighest(answers) {

  // Merge sort
  var answ = mergeSort(answers);

  var find = findWithAttr(answ, "is_accepted", true);

  if (find == -1) {
    return answ[0];
  } else {
    return answ[find];
  }

}


// Split the array into halves and merge them recursively 
function mergeSort(arr) {
  if (arr.length === 1) {
    // return once we hit an array with a single item
    return arr
  }

  const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
  const left = arr.slice(0, middle) // items on the left side
  const right = arr.slice(middle) // items on the right side

  return merge(
    mergeSort(left),
    mergeSort(right)
  )
}

// compare the arrays item by item and return the concatenated result
function merge(left, right) {
  let result = []
  let indexLeft = 0
  let indexRight = 0

  while (indexLeft < left.length && indexRight < right.length) {
    if (left[indexLeft].score < right[indexRight].score) {
      result.push(left[indexLeft])
      indexLeft++
    } else {
      result.push(right[indexRight])
      indexRight++
    }
  }

  return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight))
}


function findWithAttr(array, attr, value) {
  for (var i = 0; i < array.length; i += 1) {
    if (array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}
