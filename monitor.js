"use strict"

require("dotenv").config()

const feedsDir = process.env.WATCH_DIR
const webhook = process.env.DISCORD_WEBHOOK
const retryTimeout = process.env.RETRY_TIMEOUT
const discordToken = process.env.DISCORD_TOKEN
const discordChannel = process.env.DISCORD_UPDATE_CHANNEL_ID
const { Client, MessageEmbed } = require("discord.js")
const client = new Client()

let channel;

const chokidar = require("chokidar")
const watcher = chokidar.watch(feedsDir, { persistent: true, awaitWriteFinish: true })
const fse = require("fs-extra")
const fetch = require("node-fetch")

const readUpdateFile = file => new Promise( (resolve, reject) => {
    fse.readJson(file)
    .then( resolve )
    .catch( reject )
})

const postToDiscord = data => new Promise( ( resolve, reject ) => {

    const message = new MessageEmbed()
    .setTitle(data.title)
    .addField("Update", data.content, true)
    .setTimestamp()

    channel.send(message)
    .then(resolve)
    .catch(reject)
    
})

const deleteUpdateFile = file => new Promise( (resolve, reject) => {
    fse.unlink( file )
    .then( resolve )
    .catch( reject )
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

const scheduleRetry = file => setTimeout( () => processUpdate(file), retryTimeout)

// Start up
console.info(`Watching directory: ${feedsDir}`)

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

watcher.on("add", file => processUpdate(file))
