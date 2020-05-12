"use strict"

require("dotenv").config()

const feedsDir = process.env.WATCH_DIR
const webhook = process.env.DISCORD_WEBHOOK

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
    const payload = { content: `**${data.title}**\n${data.content}` }

    fetch(webhook, {
        method: "post",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
    })
    .then( data => {
        if(data.status >= 200 && data.status <= 299) {
            resolve(data)
        } else {
            reject(data)
        }
    })
    .catch( data => {
        console.error("ERROR", data)
        reject(data)
    })
})

const deleteUpdateFile = file => new Promise( (resolve, reject) => {
    fse.unlink( file )
    .then( resolve )
    .catch( reject )
})

const processUpdate = file => {
    readUpdateFile(file)
    .then( postToDiscord )
    .then( () => deleteUpdateFile(file) )
    .catch( err => {
        console.log(err.status, err.statusText)
        scheduleRetry(file) 
    })
}

const scheduleRetry = file => setTimeout( () => processUpdate(file), 5000)

// Start up
console.info(`Watching directory: ${feedsDir}`)
console.info(`Posting to: ${webhook}`)

watcher.on("add", file => processUpdate(file))

