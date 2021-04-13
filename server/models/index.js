let mongoose = require("mongoose");

const server = process.env.DB_HOST + ":" + process.env.DB_PORT;
const database = process.env.DB_DB;

class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(`mongodb://${server}/${database}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((error) => {
        console.log("Database connection failed ");
      });
    mongoose.set("toJSON", {
      virtuals: true,
      versionKey: false,
      transform: (doc, converted) => {
        delete converted._id;
      },
    });
  }
}

// module.exports = new Database();
export const db = new Database();
