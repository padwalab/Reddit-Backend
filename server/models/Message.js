import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

export default mongoose.model("message", MessageSchema);
