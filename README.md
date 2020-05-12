# mud-feeds-to-discord

This application monitors a directory for JSON files to post to a Discord webhook.

## Setup

Create a `.env` file to house the following variables
```
WATCH_DIR=/home/gesslar/feeds/
DISCORD_WEBHOOK=https://discordapp.com/api/webhooks/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## JSON file format
The files must be in JSON format and must include the following properties

- title - this will appear on the first line
- content - this will be the meat of the message
