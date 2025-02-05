const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const users = {}; // Mapeia socketId para peerId

io.on('connection', (socket) => {
  // Quando um peer se conecta, armazene seu ID
  socket.on('register-peer', (peerId) => {
    users[peerId] = socket.id;
  });

  socket.on('send-message', (message) => {
    const targetSocketId = users[message.to]; // Obtém o socketId do destinatário
  
    if (targetSocketId) {
      io.to(targetSocketId).emit('receive-message', message);
      console.log(`Message sent from ${message.userId} to ${message.to}`);
    } else {
      console.log(`No user found with peerId: ${message.to}`);
    }
  });  

  socket.on('disconnect', () => {
    // Remova o peerId do mapa ao desconectar
    for (let peerId in users) {
      if (users[peerId] === socket.id) {
        delete users[peerId];
      }
    }
  });
});

server.listen(5000, () => console.log("server is running on port 5000"))
