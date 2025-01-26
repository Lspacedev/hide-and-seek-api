import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  game_id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  position: { type: Array, required: true },
  status: {
    type: String,
    enum: ["CREATED", "LOST", "WON", "SEEKING", "HIDDEN"],
    default: "CREATED",
  }, //HIDDEN, SEEKING, FOUND, LOST, WON
  joined: { type: Boolean, default: false },
});
const Player = mongoose.model("Player", playerSchema);
export default Player;
