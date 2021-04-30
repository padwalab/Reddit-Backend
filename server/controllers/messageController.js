import Message from '../models/Message.js';

export let messageController = {};

// @route GET api/messages/getMessages
// @desc conversation between two users
// @access Private
messageController.getConversation = async (req, res) => {
  const { toUserId, fromUserId } = req.body;
  let messages = await Message.find({ toUserId, fromUserId });
  if (messages) res.status(200).send(messages);
};

// @route POST api/messages/sendMessage
// @desc send a message to other user
// @access Private
messageController.sendMessage = async (req, res) => {
  const { toUserId, fromUserId, text } = req.body;
  let message = new Message({ toUserId, fromUserId, text });
  message.save();
  res.json(message);
};

// @route POST api/messages/
// @desc get all conversation specific to a user
// @access Private
messageController.userMessages = async (req, res) => {
  try{
  const { userId } = req.body;
  await Message.find()
    .or([{ toUserId: userId }, { fromUserId: userId }])
    .populate('toUserId', 'firstName')
    .populate('fromUserId', 'firstName')
    .then((messages) => {
      res.send(messages);
    });
  }catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
