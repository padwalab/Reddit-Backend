import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from 'morgan';
import registerRoute from './server/routes/users.js';
import db from './server/models/index.js';

dotenv.config({ path: './config/.env' });
new db();
const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ extended: false }));
app.use('/api/user', registerRoute);

app.get('/', (req, res) =>
  res.status(200).send({
    message: 'Hello from the Reddit BackEnd...',
  })
);

export default app;
