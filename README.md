# trash-notice

LINE Bot Developments with Node.js  
This LINE Bot program would make daily reminders for what you should trash in a day, with using LINE APIs.  
All features in this program use GCP (Google Cloud Platform) services.  

***

## Flows

Overviews of how this programs would run:  

- Functions would be kicked from `Cloud Schdueler`
  - With cron services of GCP, the functions, `index.js`, would be called every 07:00 JST in a day
- Determine what the day
  - In the programs, the fucntions determine what types of trash user should throw
- Fetch User IDs to make push notifications
  - In order to determine who should be notified, the functions fetch these IDs from redis cache with using `redis` npm package
- POST to LINE API
  - `POST /v2/bot/message/push` if it's the day to notice user

***

## Environments

- GCP Stacks
  - `Cloud Functions`
    - Using main features for this program, with using Serverless functions
  - `Cloud Schedulers`
    - Cron services within the GCP
  - `Memorystore for Redis`
    - Managed Redis cache instances for storing data
    - From fetching cached data from functions on GCF, we could use `Serverless VPC connector` with VPC configurations

- Functions
  - The functions deployed on Cloud Functions is using `Node.js` and its runtime is `nodejs14`, which are provided as parameters of `gcloud` commands.
  - Note that `Memorystore for Redis` would be expected to access from same VPC subnet, so we need to use `Serverless VPC Connector` which deployed in same VPC network, and also GCF functions and redis instance(s) should be deployed in same GCP region.

***

## Customizations and debuggings

For running this programs in your environments, please follow the steps below:  

- Download the sources from GitHub
  - `git clone git@github.com:hwakabh/trash-notice.git`
    - You could also use HTTPS for fetching sources
- Installing dependencies, JavaScript packages
  - (optional) If you're using `nodebrew`, for managing multiple node.js versions, please setup your environment first
  - `npm install`
    - Since some logics here have dependencies for JavaScript packages, managed by `npm`, you need to install them first before running programs
- Deploying functions to your GCP environment with `gcloud functions deploy`
  - Be aware that there need to set some environmental variables, which are mentioned in `Runtime Environmental Variables` in GCP console

```bash
# Set environmental variables for deployment
$ export LINE_ACCESS_TOKEN='<YOUR_LINE_ACCESS_TOKEN>'
$ export REDISHOST='<MEMORYSTORE_INSTANCE_IP>'
$ export REDISPORT='<MEMORYSTORE_INSTANCE_PORT>'

# Fetch GCP core configurations
$ export REGION_NAME=$(gcloud config get-value core/region)
$ export CONNECTOR_NAME='<YOUR_VPC_CONNECTOR_NAME>'

# Deploy functions
$ gcloud functions deploy makeNotice \
> --runtime=nodejs14 \
> --trigger-http \
> --set-env-vars LINE_ACCESS_TOKEN=$LINE_ACCESS_TOKEN,REDISHOST=$REDISHOST,REDISPORT=$REDISPORT \
> --allow-unauthenticated
> --vpc-connector="$(gcloud compute networks vpc-access connectors describe $CONNECTOR_NAME --region=$REGION_NAME --format=json |jq -r .name)" \
```

- Run functions for testings
  - `gcloud functions call FUNCTION_NAME`
    - You can run functions from `gcloud` after the deployment status became `ACTIVE` with `gcloud functions list`

- Schduleing configurations

***

## Limitations and Disclaimers

- Pre-requierments for redis instance access with `Memorystore for Redis`
  - As described in Environment sections, redis-instance in GCP would be expected to access from same VPC network
  - So, you should deploy GCF functions on the region same as redis-instance

- Fetching key-values from redis-instance
  - As this scripts would fetch LINE friends IDs, to whom the program would make push notifications, we can determine these LINE friend IDs from LINE API, to GET who added the bot as friend, but currently this features is not implemented.
  - So we need to use `redis-cli` to store friend IDs manualy like below:
    - You can refer manuals of `redis-cli` via <https://redis.io/commands>
    - Also for limitations of this programs, we need to provide same value as keys in redis-server

```bash
# Connect to redis-instance (by default, port of redis would be used TCP/6379)
$ redis-cli -h $REDISHOST -p $REDISPORT
# Initialize key-values
REDISHOST:6379> FLUSHALL
OK
REDISHOST:6379> KEYS *
(empty array)

# store friend IDs
REDISHOST:6379> set name "<LINE_FRIEND_ID>"
OK
REDISHOST:6379> KEYS *
1) "<LINE_FRIEND_ID>"
REDISHOST:6379> get "<LINE_FRIEND_ID>"
"<LINE_FRIEND_ID>"
```

***

## Licensing

- As source of this program `line-bot-sdk` aligns to Apache 2.0 Licenses, all of source codes in this repository would do same as the source.
  - Souce codes in this repository are licensed under the Apache License 2.0
