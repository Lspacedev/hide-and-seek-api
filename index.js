import "dotenv/config";
import express from "express";
import cors from "cors";
import mongooseConnection from "./config/mongodb.js";
import gamesRouter from "./routes/gamesRouter.js";
import http from "http";
import { Server } from "socket.io";
import Player from "./models/player.js";
import Game from "./models/game.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});
mongooseConnection();

io.on("connection", function (socket) {
  console.log("a user connected");
  socket.on("position-update", async (data) => {
    const { gameId, playerId, role, pos } = data;
    const game = await Game.findById(gameId);
    const [filterRegion] = game.regions.filter(
      (region) => pos[0] === region.id
    );

    if (filterRegion.plays === 0) {
      socket.emit("plays-update", "Out of plays");
      return;
    }

    if (role === "Seeker") {
      io.emit("seeker-coords-update", pos);
      const updatedRegions = game.regions.map((region) => {
        if (pos[0] === region.id) {
          let obj = { ...region };
          obj.plays = obj.plays - 1;
          return obj;
        }
        return region;
      });
      const totalPlays = game.totalPlays - 1;
      await Game.updateOne(
        { _id: gameId },

        { $set: { regions: updatedRegions, totalPlays: totalPlays } }
      );
      const updatedGame = await Game.findById(gameId);

      io.emit("game-status-update", updatedGame);

      const hiders = (await Player.find({ game_id: gameId })).filter(
        (player) => player.role === "Hider"
      );

      await Promise.all(
        hiders.map(async (hider) => {
          if (hider.position[0] === pos[0]) {
            if (hider.position[1] === pos[1]) {
              await Player.updateOne(
                { _id: hider._id },

                { $set: { status: "LOST" } }
              );
              const player = await Player.findById(hider._id);
              io.emit("hider-update", player);
            }
          }
        })
      );
      let isAllFound = true;
      const updatedHiders = (await Player.find({ game_id: gameId })).filter(
        (player) => player.role === "Hider"
      );
      updatedHiders.map((hider) => {
        if (hider.status !== "LOST") {
          isAllFound = false;
        }
      });

      if (!isAllFound && totalPlays === 0) {
        await Promise.all(
          hiders.map(async (hider) => {
            await Player.updateOne(
              { _id: hider._id },

              { $set: { status: "WON" } }
            );
            const player = await Player.findById(hider._id);
            io.emit("hider-update", player);
          })
        );
        await Player.updateOne(
          { _id: playerId },

          { $set: { status: "LOST", position: pos } }
        );
        const player = await Player.findById(playerId);
        io.emit("seeker-update", player);
      }
      if (isAllFound) {
        await Player.updateOne(
          { _id: playerId },

          { $set: { status: "WON", position: pos } }
        );
        const player = await Player.findById(playerId);
        io.emit("seeker-update", player);
      }
    }
  });
  socket.on("hide-position-update", async (data) => {
    const { gameId, playerId, role, pos } = data;
    await Player.updateOne(
      { _id: playerId },

      { $set: { position: pos } }
    );
    await Player.updateOne(
      { _id: playerId },

      { $set: { status: "HIDDEN" } }
    );
    await Game.updateOne(
      { _id: gameId },

      { $set: { all_hiders_hidden: true, seeker_seeking: true } }
    );
    const player = await Player.findById(playerId);
    socket.emit("hider-update", player);
    const updatedGame = await Game.findById(gameId);

    io.emit("game-status-update", updatedGame);
  });
  socket.on("start-seeking", async (data) => {
    await Player.updateOne(
      { _id: data.playerId },

      { $set: { status: "SEEKING" } }
    );
    const player = await Player.findById(data.playerId);
    socket.emit("seeker-update", player);
  });
});

app.use("/api/games", gamesRouter);
const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`Express app listening on port ${PORT}!`)
);
