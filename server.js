"use strict"

require("dotenv").config()

const feedsDir = process.env.WATCH_DIR
const retryTimeout = process.env.RETRY_TIMEOUT
const discordToken = process.env.DISCORD_TOKEN
const discordChannel = process.env.DISCORD_UPDATE_CHANNEL_ID
const port = process.env.PORT
const { Client, MessageEmbed } = require("discord.js")
const client = new Client()

let channel;

const chokidar = require("chokidar")
const watcher = chokidar.watch(feedsDir, { persistent: true, awaitWriteFinish: true })
const fse = require("fs-extra")
const fetch = require("node-fetch")
const express = require("express")
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.urlencoded({ extended: false}))

const postToDiscord = data => new Promise( ( resolve, reject ) => {

    const message = new MessageEmbed()
    .setTitle(data.title)
    .addField("Update", data.content, true)
    .setTimestamp()

    channel.send(message)
    .then(resolve)
    .catch(reject)
    
})

const processUpdate = file => {

    if(client.readyAt === null) {
        scheduleRetry(file);
        return ;
    }
    
    readUpdateFile(file)
    .then( postToDiscord )
    .then( () => deleteUpdateFile(file) )
    .catch( err => {
        console.log(err)
        scheduleRetry(file) 
    })
}

client.login(discordToken)
.then( () => {
    console.log(`Logged into Discord`)
    client.channels.fetch(discordChannel)
    .then(results => {
        const { guild } = results
        console.log(`Found channel #${results.name} (${results.id}) on server ${guild.name} (${guild.id})`)
        channel = results
    }) 
})

app.post("/api/v1/updates", (req, res) => {
    if(!req.body.title) {
        res.status(400).send({
            success: false,
            message: "title is required"
        })
    } else if(!req.body.update) {
        res.status(400).send({
            success: false,
            message: "update is required"
        })
    }
    res.status(201).send({
        success: true,
        message: "update processed"
    })
})

const listener = app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${listener.address().port}`)
});
