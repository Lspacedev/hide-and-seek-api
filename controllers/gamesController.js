import Game from "../models/game.js";
import Player from "../models/player.js";

import { customAlphabet } from "nanoid";

const createGame = async (req, res) => {
  try {
    const { name, role } = req.body;
    const nanoid = customAlphabet("1234567890abcdefghijklmnop", 6);
    const code = nanoid();
    const regions = [
      {
        id: 1,
        name: "forest",
        plays: 3,
      },
      {
        id: 2,
        name: "clouds",
        plays: 3,
      },
      {
        id: 3,
        name: "house",
        plays: 3,
      },
      {
        id: 4,
        name: "city",
        plays: 3,
      },
      {
        id: 5,
        name: "ocean",
        plays: 3,
      },
      {
        id: 6,
        name: "mountains",
        plays: 3,
      },
    ];
    const game = await Game.create({
      name,
      code,
      regions,
      seeker_joined: role === "Seeker" ? true : false,
      all_hiders_joined: role === "Hider" ? true : false,
    });
    const player = await Player.create({
      game_id: game._id,
      name: "Player 1",
      role: role,
      position: [-1, -1],
      joined: true,
    });
    res.status(201).json({ game, player });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occured while creating game.", error });
  }
};
const joinGame = async (req, res) => {
  try {
    const { code } = req.body;

    const gameArr = await Game.find({ code: code });

    if (gameArr.length > 0) {
      const game = gameArr[0];
      const players = await Player.find({
        game_id: game._id,
      });
      const role =
        players.filter((player) => player.role === "Hider").length > 0
          ? "Seeker"
          : "Hider";
      const player = await Player.create({
        game_id: game._id,
        name: `Player ${players.length + 1}`,
        role: role,

        position: [-1, -1],
        joined: true,
      });
      if (role === "Hider") {
        await Game.updateOne(
          { _id: game._id },

          { $set: { all_hiders_joined: true } }
        );
      } else {
        await Game.updateOne(
          { _id: game._id },

          { $set: { seeker_joined: true } }
        );
      }
      const [updatedGame] = await Game.find({ code: code });
      console.log({ updatedGame });
      req.io.emit("game-status-update", updatedGame);
      res.status(201).json({ game: updatedGame, player });
    } else {
      res
        .status(404)
        .json({ error: "Invalid game code sent, game does not exist" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occured while joining game.", error });
  }
};
const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.body;
    console.log({ gameId });

    if (req.body.playerId) {
      const game = await Game.findById(gameId);
      if (game) {
        await Game.findByIdAndDelete(gameId);
      }
      await Player.findByIdAndDelete(req.body.playerId);
      res.status(201).json({ message: "Delete success" });
    } else {
      const game = await Game.findByIdAndDelete(gameId);
      const players = await Player.find({
        game_id: gameId,
      });
      if (players.length > 0) {
        const players = await Player.deleteMany({
          game_id: gameId,
        });
        req.io.emit("game-deleted");

        res.status(201).json({ message: "Delete success" });
      } else {
        res.status(201).json({ message: "Game deleted" });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occured while joining game.", error });
  }
};
export default { createGame, joinGame, deleteGame };
