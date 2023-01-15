const venom = require("venom-bot");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const fs = require("fs");
const db = require("./db.json");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

venom
  .create({
    session: "ia-bot",
    multidevice: true,
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage(async (message) => {
    //message.body
    if (message.isGroupMsg === false && message.body !== undefined) {
      const number = db.find((n) => n.number === message.from);
      if (!number) return;
      console.log(message.body);
      let text = (number.messages += "\n\nHuman: " + message.body);
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Human: ${message.body}`,
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      });

      text += completion.data.choices[0].text;
      const updateJson = db.map((i) => {
        if (i.number === message.from) {
          i.messages = text;
        }
        return i;
      });

      const toStringData = JSON.stringify(updateJson);

      fs.writeFileSync(`${__dirname}/db.json`, toStringData);

      client
        .sendText(message.from, completion.data.choices[0].text.replace("\n", "").replace("\n", "").replace("robot", "").replace("robô", "").replace("bot", ""))
        .then((result) => {
          //console.log("Result: ", result);
        })
        .catch((erro) => {
          console.error("Error when sending: ", erro);
        });
    }
  });
}
