import Message from '../models/Message.js';

export let messageController = {};

// @route POST api/messages/sendMessage
// @desc send a message to other user
// @access Private
messageController.sendMessage = async (req, res) => {
  try {
    const { toUserId, fromUserId, text } = req.body;
    let message = new Message({ toUserId, fromUserId, text });
    await message.save().then((doc) => doc.populate('toUserId', 'firstName').populate('fromUserId', 'firstName').execPopulate());
    res.send(message);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route POST api/messages/
// @desc get all conversation specific to a user
// @access Private
messageController.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    await Message.find()
      .or([{ toUserId: userId }, { fromUserId: userId }])
      .populate('toUserId', 'firstName')
      .populate('fromUserId', 'firstName')
      .then((messages) => {
        res.send(messages);
      });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
