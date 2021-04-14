import { CatsController } from '../controllers/index.js';
module.exports = (app) => {
  app.get('/api', (req, res) =>
    res.status(200).send({
      message: 'Welcome to the Reddit backend',
    })
  );
  app.post('/api/cat/:name', CatsController.create);
};
