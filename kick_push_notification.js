// Get Credentials securely from environmental variables
var line_access_token = process.env.LINE_ACCESS_TOKEN;
var target_user_id = process.env.TARGET_USER_ID;

// Build request body for POST to messaging API
var request = require('request');
var headers = {
    'User-Agent': 'Mozilla',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${line_access_token}`,
};
var reqbody = {
    'to': target_user_id,
    'messages': [
        {
            "type": "template",
            "altText": "Confirm coding challenge status",
            "template": {
                "type": "confirm",
                "text": "Have you already done today's coding challenge ??",
                "actions": [
                    {
                      "type": "message",
                      "label": "Yes",
                      "text": "Done"
                    },
                    {
                      "type": "message",
                      "label": "No",
                      "text": "Yet"
                    }
                ]
            }
        }
    ]
};

var options = {
    uri: 'https://api.line.me/v2/bot/message/push',
    method: 'POST',
    headers: headers,
    json: reqbody,
    rejectUnauthorized: false,
};

// POST to API
request.post(options, function(error, response, body){});