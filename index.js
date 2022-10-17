import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config();

//SET UP
const app = express();
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: process.env.CORS,
});

var socketsList = [];

// SERVER START
httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`[+] SERVER STARTED ON PORT: ${process.env.PORT}`);
});

app.get("/", (req, res) => {
  console.log(`NEW CONNECTION`);
  res.send(`CHAT API CONNECTED...`);
});

io.on("connection", onConnection);

function onConnection(socket) {
  console.log(`[i] HANDLING CONNECTION FOR: ${socket.id}`);
  preinitializeClient(socket);

  socket.on("init", ({ nickname }) => {
    console.log(`[i] INITIALIZING CLIENT`);
    initializeSocket(socket, nickname);
  });

  socket.on("client-ready", () => {});

  socket.on("send-msg", ({ msg }) => {
    console.log(`[i] ${socket.id} SENT: ${msg}`);
    transportMSG(socket, msg);
  });

  socket.on("disconnect", () => {
    console.log(`[X] CLIENT DISCONNECTED: ${socket.id}`);
    broadcast("recv-msg", { msg: `${socket.data.name} LEFT THE CHAT.` });
  });
}

// FUNCTIONS ===================================================================
function preinitializeClient(socket) {
  socket.join("room_1");
  console.log(`[O] CLIENT PREINITIALIZED: ${socket.id}`);
  sendParticipantList();
}

function initializeSocket(socket, nickname) {
  console.log(`[i] ALIAS > ${socket.id} : ${nickname}`);
  socket.data.name = nickname;
  socketsList.push(socket);
  sendParticipantList();
}

function broadcast(event, content) {
  console.log(`[i] BROADCASTING: ${event}`);
  io.emit(event, content);
}

function transportMSG(socket, msg) {
  console.log(`[i] TRANSPORTING: ${socket.id} => ${msg}`);
  socket.to("room_1").emit("recv-msg", { sender: socket.data.name, msg });
}

function sendParticipantList() {
  let participantNames = getParticipantNames();
  broadcast("recv-list", participantNames);
}

function getParticipantNames() {
  let names = socketsList.map((socket) => socket.data.name);
  console.log(`[i] GRABBING PARTICIPANTS NAMES`);
  return names;
}
