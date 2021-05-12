import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });
import app from "../app.js";

const StartServer = () => {
  const port = parseInt(process.env.PORT, 10) || 8000;
  app.listen(port, () => {
    // eslint-dis able-next-line no-console
    console.log(`listening on port ${port}`);
  });
};

// setTimeout(StartServer, 10000);
StartServer();
