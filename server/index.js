const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
var canvas = require("canvas"),
  jsdom = require("jsdom"),
  C2S = require("canvas2svg");

var document = jsdom.jsdom();
var ctx = new C2S({ document: document });

io.on("connection", onConnection);

function onConnection(socket) {
  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
}

const port = 8080;
server.listen(port, () => console.log(`server is running on port ${port}`));
