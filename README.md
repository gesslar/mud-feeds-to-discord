# mud-feeds-to-discord

This application monitors a directory for JSON files to post to a Discord channel.

When this application is started, it will find all files in the `WATCH_DIR` and attempt to broadcast the messages contained within those files to the channel specified by the `DISCORD_UPDATE_CHANNEL_ID`. 

This application also monitors the `WATCH_DIR` for any new files being added and does the same as above.

If there are any errors, the application will schedule a retry after `RETRY_TIMEOUT` seconds.

Once a file has been successfully processed and posted, the file will be removed.

## Setup

### Step 1

1. Visit the [Developer's portal](https://discordapp.com/developers/applications/) and create a new application. Record the Client ID, you will need it for the next bit
2. Click Bot on the left
3. Click Add Bot and record the Token for later use
4. Visit https://discordapp.com/oauth2/authorize?client_id=XXXXXXXXXXXXXXXXXX&scope=bot where XXXXXXXXXXXXXXXXXX is your Client ID from #1 above
5. Authorize and add your bot to your server

### Step 2

Get the ID for the channel you wish to post to by right-clicking on the channel and clicking Copy ID

![image](https://user-images.githubusercontent.com/1266935/114635703-45329300-9c93-11eb-9da4-f92b05b0fa0e.png)

### Step 3

Create a `.env` file in the root of the Node.js directory to house the following variables
```
WATCH_DIR=/home/gesslar/feeds/
DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DISCORD_UPDATE_CHANNEL_ID=XXXXXXXXXXXXXXXXXX
RETRY_TIMEOUT=5000
```

### Step 4

Write a command to write files to the directory in which the Node.js app is watching.

## JSON file format
The files must be in JSON format and must include the following properties

- title - this will appear on the first line
- content - this will be the meat of the message
