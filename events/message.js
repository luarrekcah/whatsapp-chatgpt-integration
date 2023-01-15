const fs = require("fs");
const db = require("../db.json");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports.run = async message => {
    console.log(message);
    if (message.isGroupMsg === false && message.body !== undefined) {
        if(message.type !== 'chat') return;
        if(message.body.length > 1000 || message.body.length <= 5) return;
        const number = db.find((n) => n.number === message.from);
        if (!number) {
          client.sendText(
            message.from,
            "Um momento, vou te adicionar na minha lista de pessoas autorizadas... Aguarde 5 segundos e tente novamente."
          );
          db.push({number: message.from, messages: ''})
          const toStringData = JSON.stringify(db);
          fs.writeFileSync(`${__dirname}/db.json`, toStringData);
          return;
        }
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