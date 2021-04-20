import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from 'morgan';
import userRoute from './server/routes/users.js';
import registerRoute from './server/routes/users.js';
import inviteRoute from './server/routes/invites.js';
import messageRoute from './server/routes/messages.js';
<<<<<<< HEAD
=======
import imageRoute from './server/routes/image.js';
>>>>>>> master
import db from './server/models/index.js';
import passport from 'passport';
import ps from './server/config/passport.js';

dotenv.config({ path: './config/.env' });
new db();
const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ extended: true }));
app.use('/api/user', userRoute);
app.use(express.json({ extended: false }));
app.use('/api/user', registerRoute);
app.use('/api/invite', inviteRoute);
app.use('/api/message', messageRoute);
app.use('/api/image', imageRoute);
// passport configure
app.use(passport.initialize());
const passportJwt = ps(passport);

app.get('/', (req, res) =>
  res.status(200).send({
    message: 'Hello from the Reddit BackEnd...',
  })
);

export default app;
