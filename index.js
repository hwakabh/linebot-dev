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


// Main functions
exports.makeNotices = (req, res) => {
  // Get Credentials securely from environmental variables
  var line_access_token = process.env.LINE_ACCESS_TOKEN;
  if (process.env.TZ == 'undefined') {
      process.env.TZ = 'Asia/Tokyo';
  }

  // Import & Setup request
  var request = require("request");
  var line_api_endpoint = "https://api.line.me/v2/bot/message/push";
  var headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${line_access_token}`,
  };

  // Import & Setup node-redis
  const redis = require("redis");
  const url = require("url");
  // Instanciate Redis client
  if (process.env.REDISTOGO_URL) {
      var redis_target = url.parse(process.env.REDISTOGO_URL);
      var redisClient = redis.createClient(redis_target.port, redis_target.hostname);
      redisClient.auth(redis_target.auth.split(":")[1]);
  } else {
      var redisClient = redis.createClient();
  }
  redisClient.on("error", function (err) {
      console.log("Failed to connect redis-server: " + err);
      res.status(500).send("Failed to connect redis-server...")
  })

  // Determine if make notifications or not
  redisClient.keys('*', function (err, keys) {
      keys.forEach(function (fid) {
          // Set message of the day
          var text = set_daily_message();
          // Send message to user on specific day
          if (text !== "") {
              var message = {
                type: "text",
                text: set_daily_message()
              };

              console.log(`>>> Trying to send message to user: ${fid}`);
              console.log(message);
              // Build HTTP request body
              var reqbody = {
                  "to": fid,
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
              res.status(200).send("Sucessfully noticed to users.");

          } else {
              res.status(200).send("Nothing to do for today.");
          }

      });
  });
};
