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
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  },
});

var socketsList = [];

// SERVER START
httpServer.listen(process.env.PORT, () => {
  console.log(`[+] SERVER STARTED ON PORT: ${process.env.PORT}`);
});

app.get("/", (req, res) => {
  console.log(`NEW CONNECTION`);
  res.send(`CHAT API CONNECTED...`);
});

io.on("connection", onConnection);

function onConnection(socket) {
  preinitializeClient(socket);

  socket.on("init", ({ nickname }) => {
    initializeSocket(socket, nickname);
    sendParticipantList();
  });

  socket.on("send-msg", ({ msg }) => {
    transportMSG(socket, msg);
  });

  socket.on("disconnect", () => {
    console.log(`[X] CLIENT DISCONNECTED: ${socket.id}`);
    broadcast("recv-msg", { msg: `${socket.data.name} LEFT THE CHAT.` });
  });
}

// FUNCTIONS ===================================================================
function broadcast(event, content) {
  io.emit(event, content);
}

function transportMSG(socket, msg) {
  console.log(`SOMEONE SENT A MSG`);
  socket.to("room_1").emit("recv-msg", { sender: socket.data.name, msg });
}

function preinitializeClient(socket) {
  socket.join("room_1");
  console.log(`[O] NEW CLIENT CONNECTED: ${socket.id}`);
  socket.data.name = "me";
}

function initializeSocket(socket, nickname) {
  console.log(`SETTING <${socket.id}> NAME TO -${nickname}-`);
  socket.data.name = nickname;
  socketsList.push(socket);
}

function sendParticipantList() {
  let participantNames = getParticipantNames();
  io.emit("recv-list", participantNames);
}

function getParticipantNames() {
  let names = socketsList.map((socket) => socket.data.name);
  console.log(names);
  return names;
}
