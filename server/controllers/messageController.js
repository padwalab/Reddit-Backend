import Message from "../models/Message.js";

export let messageController = {};

// @route GET api/messages/getMessages
// @desc conversation between two users
// @access Public
messageController.getMessages = async (req, res) => {
  const { toUser, fromUser } = req.body;
  let messages = await Message.find({ toUser, fromUser });
  if (messages) res.status(200).send(messages);
};

// @route POST api/messages/sendMessage
// @desc send a message to other user
// @access Public
messageController.sendMessage = async (req, res) => {
  const { toUser, fromUser, text } = req.body;
  let message = new Message({ toUser, fromUser, text });
  message.save();
  res.status(200).send("Message sent successfully");
};
