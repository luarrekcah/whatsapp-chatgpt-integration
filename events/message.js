const fs = require("fs");
const db = require("../db.json");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const autorizedGroups = ["553198585952-1571260307@g.us"];

module.exports.run = async (client, message) => {
  if (message.body !== undefined) {
    if (message.isGroupMsg && !autorizedGroups.includes(message.from)) return;
    if (
      message.type === "ptt" ||
      message.type === "video" ||
      message.type === "image"
    )
      return;
    if (message.body.length > 1000 || message.body.length <= 5) return;
    const number = db.find((n) => n.number === message.from);
    if (!number) {
      client.sendText(
        message.from,
        "Um momento, vou te adicionar na minha lista de pessoas autorizadas... Aguarde 5 segundos e tente novamente."
      );
      db.push({ number: message.from, messages: "" });
      const toStringData = JSON.stringify(db);
      fs.writeFileSync(`${__dirname}/../db.json`, toStringData);
      return;
    }
    console.log(message);
    let text = (number.messages += `\n\nHuman: ${message.quotedMsg ? message.quotedMsg.body : ''} ${message.body}`);
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
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

    fs.writeFileSync(`${__dirname}/../db.json`, toStringData);

    if (message.quotedMsg) {
      client
        .sendText(
          message.from,
          completion.data.choices[0].text
            .replace("\n", "")
            .replace("\n", "")
            .replace("Robot:", "")
            .replace("Robô:", "")
            .replace("Bot:", "")
        )
        .then((result) => {
          //console.log("Result: ", result);
        })
        .catch((erro) => {
          console.error("Error when sending: ", erro);
        });
    } else {
      client
        .reply(
          message.from,
          completion.data.choices[0].text
            .replace("\n", "")
            .replace("\n", "")
            .replace("Robot:", "")
            .replace("Robô:", "")
            .replace("Bot:", ""),
          message.id
        )
        .then((result) => {
          //console.log("Result: ", result);
        })
        .catch((erro) => {
          console.error("Error when sending: ", erro);
        });
    }
  }
};
