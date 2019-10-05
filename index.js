// Importing modules
const server = require("express")();
const line = require("@line/bot-sdk")

// Paramenter Settings
// Notes: Access token and channel secret should be used as environmental variables
const line_conf = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const bot = new line.Client(line_conf);

// Web Server configurations
server.listen(process.env.PORT || 3000);

// Express Router Configurations
server.post('/bot/webhook', line.middleware(line_conf), (req, res, next) => {
    res.sendStatus(200);

    let events_processed = [];
    req.body.events.forEach((event) => {
        if (event.type == "message" && event.message.type == "text"){
            if (event.message.text == "help"){
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "Hello, what could I help you ??"
                }));
            } else {
                events_processed.push(bot.replyMessage(event.replyToken, {
                  type: "text",
                  text: "I am a your bot !!"
                }));
            }
        }
    });

    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    )
});
