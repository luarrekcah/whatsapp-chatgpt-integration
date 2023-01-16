const venom = require("venom-bot");

//handlers
const messageHandler = require(`./events/message.js`);

venom
  .create({
    session: "ia-bot",
    multidevice: true,
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

const start = (client) => {
  client.onMessage(async (message) => {
    return messageHandler.run(client, message);
  });
};
