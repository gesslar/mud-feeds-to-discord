"use strict"

require("dotenv").config()

const feedsDir = process.env.WATCH_DIR
const retryTimeout = process.env.RETRY_TIMEOUT
const discordToken = process.env.DISCORD_TOKEN
const discordChannel = process.env.DISCORD_UPDATE_CHANNEL_ID
const { Client, EmbedBuilder, GatewayIntentBits } = require("discord.js")
const discordClient = new Client({
    intents: [
        GatewayIntentBits.GuildMessages
    ]
})

let channel

const chokidar = require("chokidar")
const watcher = chokidar.watch(feedsDir, { persistent: true, awaitWriteFinish: true })
const fse = require("fs-extra")

const readUpdateFile = file => new Promise( (resolve, reject) => {
    fse.readJson(file)
    .then( resolve )
    .catch( reject )
})

const postToDiscord = data => new Promise( ( resolve, reject ) => {
    const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setDescription(data.content)
        .setColor("#ffd700")

    if (data.author !== undefined)
        embed.setAuthor({ name: data.author })

    channel.send({ embeds: [ embed ] })
        .then(resolve)
        .catch(reject)
})

const deleteUpdateFile = file => new Promise( (resolve, reject) => {
    fse.unlink( file )
    .then( resolve )
    .catch( reject )
})

const processUpdate = file => {

    if(discordClient.readyAt === null) {
        scheduleRetry(file)
        return 
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

discordClient.login(discordToken)
.then( () => {
    console.log(`Logged into Discord`)
    discordClient.channels.fetch(discordChannel)
    .then(results => {
        const { guild } = results
        console.log(`Found channel #${results.name} (${results.id}) on server ${guild.name} (${guild.id})`)
        channel = results
    })
})

watcher.on("add", file => processUpdate(file))
