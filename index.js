// Importing modules
const server = require("express")();
const line = require("@line/bot-sdk")

// Paramenter Settings
// Notes: Access token and channel secret should be used as environmental variables
const line_conf = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

// Web Server configurations
server.listen(process.env.PORT || 3000);

// Express Router Configurations
server.post('/bot/webhook', line.middleware(line_conf), (req, res, next) => {
    res.sendStatus(200);
    console.log(req.body);
});
