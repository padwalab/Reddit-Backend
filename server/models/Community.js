import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  images: [
    {
      type: [String],
    },
  ],
  rules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rule",
    },
  ],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

export default mongoose.model("community", CommunitySchema);
