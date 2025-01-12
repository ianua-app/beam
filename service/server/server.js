const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const express = require("express");
const path = require('path');
const bodyParser = require('body-parser')

require('dotenv').config();
// based on examples at https://www.npmjs.com/package/ws 
const WebSocketServer = WebSocket.Server;

var PRIMARY_PORT = 8080;
if (process.env.PRIMARY_PORT) PRIMARY_PORT = process.env.PRIMARY_PORT;
var SECONDARY_PORT = 8001;
if (process.env.SECONDARY_PORT) SECONDARY_PORT = process.env.SECONDARY_PORT;

var app = express();
app.use(express.static('./public'));

app.get('/parameters', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  var result = {};
  if (process.env.CLIENT_PREFIX) result["CLIENT_PREFIX"] = process.env.CLIENT_PREFIX;
  if (process.env.CLIENT_SUFFIX) result["CLIENT_SUFFIX"] = process.env.CLIENT_SUFFIX;
  res.end(JSON.stringify(result));
});

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname + "/../public", 'index.html'));
});

var httpServer;
if (process.env.TLS == "TRUE") {
  const serverConfig = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };

  httpServer = https.createServer(serverConfig, app);
}
else {
  httpServer = http.createServer(app);
}

httpServer.listen(PRIMARY_PORT);

// var expressserver = app.listen(PRIMARY_PORT, function(){
//   console.log("Server started at http://localhost:" + PRIMARY_PORT);
// });
// ----------------------------------------------------------------------------------------

const clientsByRoom = {};
const clientsById = {};
const clients = {};
const rooms = {};

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', function (ws, req) {

  console.log("new ws connection");

  const ip = req.socket.remoteAddress;
  clients[ip] = ws;

  ws.on('message', function (message) {
    // Broadcast any received message to all clients
    var messageData = JSON.parse(message);

    if (messageData.setScene !== undefined) {
      console.log(`Setting room ${messageData.room} scene to ${messageData.setScene}`);
      rooms[messageData.room] = messageData.setScene;
    }

    if (messageData.dest !== "ping") {
      clientsByRoom[ip] = messageData.room;
      if (!clientsById[ip]) clientsById[ip] = messageData.uuid;

      //console.log('received: %s', message);
      wss.clients.forEach(function each(client) {
        //console.log("Testing to send to client: " + clientsById[ip] + " - " + ip);
        if (client.readyState === WebSocket.OPEN && clientsByRoom[ip] && clientsByRoom[ip] === messageData.room) {
          // console.log("Sending message to client " + clientsById[ip]);

          if (rooms[messageData.room]) {
            messageData.setScene = rooms[messageData.room];
            message = JSON.stringify(messageData);
          }

          client.send(message);
        }
        else if (client.readyState !== WebSocket.OPEN)
          console.log("Not sending message to client because socket status is: " + client.readyState);
        else if (!clientsByRoom[ip])
          console.log("Not sending message to client because room record doesn't exist");
        else if (clientsByRoom[ip] !== messageData.room)
          console.log("Not sending message to client because client is not in the room " + messageData.room);
        else
          console.log("Not sending message");
      });
    }
    else {
      //console.log("ping message from: " + ip);
    }
  });

  ws.on('close', function close() {
    console.log('disconnected ' + ip);
  });

  ws.on('error', () => {
    console.log("Terminating websocket connection for: " + clientsById[ws]);
    ws.terminate();
  });
});

console.log('Server running on ' + PRIMARY_PORT);

// ----------------------------------------------------------------------------------------

// Separate server to redirect from http to https
if (SECONDARY_PORT) {
  http.createServer(function (req, res) {
    console.log(req.headers['host'] + req.url);
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(SECONDARY_PORT);
}