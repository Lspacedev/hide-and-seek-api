import { Router } from "express";
import gamesController from "../controllers/gamesController.js";

const gamesRouter = Router();
gamesRouter.get("/test", (req, res) => {
  res.json({ message: "alive" });
});

gamesRouter.post("/create", gamesController.createGame);
gamesRouter.post("/join", gamesController.joinGame);
gamesRouter.delete("/delete", gamesController.deleteGame);

export default gamesRouter;
