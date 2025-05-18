const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Poker backend running");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("test", (data) => {
    console.log("Test event received:", data);
    socket.emit("test_response", { message: "Test event acknowledged" });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
