// Get Credentials securely from environmental variables
var line_access_token = process.env.LINE_ACCESS_TOKEN;
// For Debugging
var target_user_id = process.env.LINE_TARGET_USER_ID;

// Import & Setup request
var request = require("request");
var line_api_endpoint = "https://api.line.me/v2/bot/message/push";
var headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${line_access_token}`,
};

// Import & Setup node-redis


// Determine the day of week, and define message of the day
// Mon+Thr -> 可燃ゴミ
// Sat -> 不燃ゴミ(第1/3週のみ)
// Sat -> ペットボトル(第2/4週のみ)
// Fri -> ビン/カン/段ボール
function get_day_index(date_checked) {
    try {
        date_checked.getDate();
        var d = date_checked;
    } catch (e) {
        var d = new Date(date_checked[0],date_checked[1],date_checked[2]);
    }

    var c = 1;
    for (var i = d.getDate(); i>7; i-=7) {
        c++;
    }
    // For debugging
    const days = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT" ];
    console.log(`>>> Today is ${c}-th ${days[d.getDay()]} in the month`);
    return c;
};


function set_daily_message() {
    var msg = "";
    var today = new Date;
    // var today = new Date("2020/10/05");
    var day_of_today = today.getDay();

    switch(day_of_today) {
        case 1:
            msg = "今日は「可燃ゴミ」のゴミ出しの日です";
            break;
        case 4:
            msg = "今日は「可燃ゴミ」のゴミ出しの日です";
            break;
        case 5:
            msg = "今日は「ビン・カン・段ボール」のゴミ出しの日です";
            break;
        case 6:
            if (get_day_index(today) == 1 || get_day_index(today) == 3) {
                msg = "今日は「不燃ゴミ」のゴミ出しの日です";
            } else if (get_day_index(today) == 2 || get_day_index(today) == 4) {
                msg = "今日は「ペットボトル」のゴミ出しの日です";
            } else {
                msg = "";
            }
            break;
        default:
            msg = "";
            break
    }
    return msg;
};


function exec_multicast() {
    // TODO: Fetch UserIds from redis cache
    var user_ids = [];

    // Set message of the day
    var text = set_daily_message();
    // Send message to user on specific day
    if (text !== "") {
        var message = {
          type: "text",
          text: set_daily_message()
        };

        // For debugging: if environmental variable: LINE_TARGET_USER_ID exists, force to use it
        if (target_user_id) {
            console.log(`>>> DEBUG: Force to use userId provided by user: ${target_user_id}`)
            user_ids = [];
            user_ids.push(target_user_id)
        }

        user_ids.forEach(function (uid) {
            console.log(`>>> Trying to send message to user: ${uid}`);
            console.log(message);
            // Build HTTP request body
            var reqbody = {
                "to": uid,
                "messages": [message]
            };
            var options = {
                uri: line_api_endpoint,
                method: "POST",
                headers: headers,
                json: reqbody,
                rejectUnauthorized: false,
            };
            // Calling API with request module
            request.post(options, function(error, response, body){});
        });

    } else {
        console.log(">>> Nothing to do for today...");
    }
};


// Starting closed-loop with intervals (43,200,000 msec = 12 hours)
// setInterval(exec_multicast, 43200000);
setInterval(exec_multicast, 3000);