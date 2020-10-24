// Importing modules
const server = require("express")();
const line = require("@line/bot-sdk");

// Paramenter Settings
// Notes: Access token and channel secret should be used as environmental variables
const line_conf = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const bot = new line.Client(line_conf);
var friendIds = [];

// Web Server configurations
server.listen(process.env.PORT || 3000);

// Express Router Configurations
server.post('/bot/webhook', line.middleware(line_conf), (req, res, next) => {
    res.sendStatus(200);

    console.log(">>>>>>>>> Reponse from User: ");
    console.log(req.body);
    console.log("");

    if (req.body.events[0].type === 'follow') {
        var addedUserId = req.body.events[0].source.userId;
        console.log(`>>>>>>>>> Somebody added me, userId: ${addedUserId}`);
        friendIds.push(addedUserId);
        console.log("");
    }
    if (req.body.events[0].type === 'unfollow') {
        var blockedUserId = req.body.events[0].source.userId;
        var deleteIndex = friendIds.indexOf(blockedUserId);
        console.log(`>>>>>>>>> Somebody blocked me, userId: ${blockedUserId}`);
        friendIds.splice(deleteIndex, 1);
        console.log("");
    }

    console.log(">>> DEBUG: Current My Friends: ");
    friendIds.forEach(function (friendId) {
        console.log(`${friendId}`);
    });
    console.log("");

    // For interactive messages and define defalt messages
    let events_processed = [];
    req.body.events.forEach((event) => {
        if (event.type == "message" && event.message.type == "text") {
            if (event.message.text == "help") {
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "HELP MESSAGE HERE"
                }));
            } else {
                events_processed.push(bot.replyMessage(event.replyToken, {
                  type: "text",
                  text: "FOR INTERACTIVE MESSAGE HANDLINGS"
                }));
            }
        }
    });

    Promise.all(events_processed).then(
        (response) => {
            console.log(`>>>>>>>>> ${response.length} event(s) processed.`);
            console.log("");
        }
    )
});
