const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("./generated/prisma");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const prisma = new PrismaClient();

// Test Prisma connection on startup
(async () => {
  try {
    await prisma.$connect();
    console.log("Prisma connected to Postgres");
  } catch (err) {
    console.error("Prisma connection error:", err);
  }
})();

app.get("/", (req, res) => {
  res.send("Poker backend running");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("test", (data) => {
    console.log("Test event received:", data);
    socket.emit("test_response", { message: "Test event acknowledged" });
  });

  // Public Table Matchmaking
  socket.on("join_table", async ({ userId }) => {
    try {
      // 1. Find a table (GameSession) with <6 players and ≥3 spots free
      let session = await prisma.gameSession.findFirst({
        where: {
          players: {
            some: {},
          },
        },
        include: { players: true },
      });

      // If no session or session is full, create a new one
      if (!session || session.players.length >= 6 || session.players.length < 3) {
        session = await prisma.gameSession.create({ data: {} });
        session.players = [];
      }

      // 2. Add the user as a player
      let player;
      if (userId) {
        player = await prisma.player.create({
          data: {
            userId,
            gameSessionId: session.id,
            seatNumber: session.players.length + 1,
            isBot: false,
            buyIn: 1000, // Example buy-in, adjust as needed
          },
        });
      } else {
        // Guest user (no userId)
        player = await prisma.player.create({
          data: {
            gameSessionId: session.id,
            seatNumber: session.players.length + 1,
            isBot: false,
            buyIn: 1000,
          },
        });
      }
      session.players.push(player);

      // 3. Fill with bots if needed (min 4 players)
      const botsNeeded = Math.max(4 - session.players.length, 0);
      for (let i = 0; i < botsNeeded; i++) {
        const bot = await prisma.player.create({
          data: {
            gameSessionId: session.id,
            seatNumber: session.players.length + 1,
            isBot: true,
            buyIn: 1000,
          },
        });
        session.players.push(bot);
      }

      // 4. Respond to client with session and player info
      socket.emit("join_table_success", {
        sessionId: session.id,
        playerId: player.id,
        players: session.players,
      });
      // Optionally, notify others at the table
      socket.join(session.id);
      io.to(session.id).emit("table_update", { players: session.players });
    } catch (err) {
      console.error("join_table error:", err);
      socket.emit("join_table_error", { message: "Failed to join table." });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
