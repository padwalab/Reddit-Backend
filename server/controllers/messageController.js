import Message from "../models/Message.js";

export let messageController = {};

// @route GET api/messages/getMessages
// @desc conversation between two users
// @access Public
messageController.getMessages = async (req, res) => {
  const { toUserId, fromUserId } = req.body;
  let messages = await Message.find({ toUserId, fromUserId });
  if (messages) res.status(200).send(messages);
};

// @route POST api/messages/sendMessage
// @desc send a message to other user
// @access Public
messageController.sendMessage = async (req, res) => {
  const { toUserId, fromUserId, text } = req.body;
  let message = new Message({ toUserId, fromUserId, text });
  message.save();
  res.json(message);
};
