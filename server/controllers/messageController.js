import Message from '../models/Message.js';
import { redisClient } from '../config/redisClient.js';

export let messageController = {};

// @route POST api/messages/sendMessage
// @desc send a message to other user
// @access Private
messageController.sendMessage = async (req, res) => {
  try {
    const { toUserId, fromUserId, text } = req.body;
    let message = new Message({ toUserId, fromUserId, text });
    await message
      .save()
      .then((doc) =>
        doc
          .populate('toUserId', 'firstName')
          .populate('fromUserId', 'firstName')
          .execPopulate()
      );

    redisClient.get(userId, async (err, data) => {
      // If value for key is available in Redis
      if (data) {
        const updatedData = [...data, message];
        redisClient.setex(userId, 36000, JSON.stringify(updatedData));
      }
      // If value for given key is not available in Redis
      else {
        await Message.find()
          .or([{ toUserId: userId }, { fromUserId: userId }])
          .populate('toUserId', 'firstName')
          .populate('fromUserId', 'firstName')
          .then((messages) => {
            redisClient.setex(userId, 36000, JSON.stringify(messages));
          });
      }
    });

    res.send(message);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route GET api/messages/
// @desc get all conversation specific to a user
// @access Private
messageController.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    redisClient.get(userId, async (err, data) => {
      // If value for key is available in Redis
      if (data) {
        res.send(messages);
      }
      // If value for given key is not available in Redis
      else {
        await Message.find()
          .or([{ toUserId: userId }, { fromUserId: userId }])
          .populate('toUserId', 'firstName')
          .populate('fromUserId', 'firstName')
          .then((messages) => {
            redisClient.setex(userId, 36000, JSON.stringify(messages));
            res.send(messages);
          });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
