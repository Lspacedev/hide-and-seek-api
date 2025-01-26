import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  regions: { type: Array, required: true },
  rooms: { type: Number, default: 6 },
  totalPlays: { type: Number, default: 18 },
  seeker_joined: { type: Boolean, default: false },
  all_hiders_joined: { type: Boolean, default: false },
  seeker_seeking: { type: Boolean, default: false },
  all_hiders_hidden: { type: Boolean, default: false },
});
const Game = mongoose.model("game", gameSchema);
export default Game;
