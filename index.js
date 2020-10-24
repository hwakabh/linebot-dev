// Importing modules
const server = require("express")();
const line = require("@line/bot-sdk");
const redis = require("redis");
const url = require("url");


// Paramenter Settings
// Notes: Access token and channel secret should be used as environmental variables
const line_conf = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};
const bot = new line.Client(line_conf);
// Instantiate Redis client
if (process.env.REDISTOGO_URL) {
    var redis_target = url.parse(process.env.REDISTOGO_URL);
    var redisClient = redis.createClient(redis_target.port, redis_target.hostname);
    redis_client.auth(redis_target.auth.split(":")[1]);
} else {
    var redisClient = redis.createClient();
}
redisClient.on("error", function (err) {
    console.log("Failed to connect redis-server: " + err);
})


var friendIds = [];

const defaultMessage = `
可燃ゴミ: 月曜日 と 木曜日
不燃ゴミ: 第1/3土曜日
ペットボトル: 第2/4土曜日
ビン/カン/段ボール: 金曜日
`;

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
        redisClient.set(addedUserId, addedUserId);
        console.log("");
    }
    if (req.body.events[0].type === 'unfollow') {
        var blockedUserId = req.body.events[0].source.userId;
        var deleteIndex = friendIds.indexOf(blockedUserId);
        console.log(`>>>>>>>>> Somebody blocked me, userId: ${blockedUserId}`);
        friendIds.splice(deleteIndex, 1);
        redisClient.del(addedUserId);
        console.log("");
    }

    console.log(">>> DEBUG: UserIds in redis cache: ");
    redisClient.get('*', function (err, reply) {
        console.log(reply);
    });
    console.log("");

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
                  text: defaultMessage
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
