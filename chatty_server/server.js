// server.js

const express = require('express');
const SocketServer = require('ws').Server;

const uuidv1 = require('uuid/v1')

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
    // Make the express server serve static assets (html, javascript, css) from the /public folder
    .use(express.static('public'))
    .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${PORT}`));

// Create the WebSockets server
const wss = new SocketServer({ server });

const serverState = {
    onlineClientCount: 0
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    serverState.onlineClientCount = wss.clients.size
    // * send online client count
    wss.clients.forEach(function each(client) {
        const userCountObj = { type: 'onlineClientCount', onlineCount: serverState.onlineClientCount }
        const stringifyData = JSON.stringify(userCountObj)
        client.send(stringifyData)
    })

    ws.on("message", function incoming(data) {

        wss.clients.forEach(function each(client) {
            const cleanData = JSON.parse(data)
            const stringifyData = JSON.stringify(cleanData)
            client.send(stringifyData)
        })
    })

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    ws.on('close', () => {
        console.log('Client disconnected')

        serverState.onlineClientCount--

        // * send online client count
        wss.clients.forEach(function each(client) {
            const userCountObj = { type: 'onlineClientCount', onlineCount: serverState.onlineClientCount }
            const stringifyData = JSON.stringify(userCountObj)
            client.send(stringifyData)
        })
    });
});