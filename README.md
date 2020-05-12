# mud-feeds-to-discord

This application monitors a directory for JSON files to post to a Discord webhook.

When this application is started, it will find all files in the `WATCH_DIR` and attempt to broadcast the messages contained within those files to the `DISCORD_WEBHOOK`. 

This application also monitors the `WATCH_DIR` for any new files being added and does the same as above.

If there are any errors, the application will schedule a retry after `RETRY_TIMEOUT` seconds.

## Setup

Create a `.env` file to house the following variables
```
WATCH_DIR=/home/gesslar/feeds/
DISCORD_WEBHOOK=https://discordapp.com/api/webhooks/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RETRY_TIMEOUT=5000
```

## JSON file format
The files must be in JSON format and must include the following properties

- title - this will appear on the first line
- content - this will be the meat of the message
