import mongoose from "mongoose";

let catSchema = new mongoose.Schema({
  name: String,
});

export const Cat = mongoose.model("Cat", catSchema);
