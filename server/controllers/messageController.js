// import Message from "../models/Message.js";
// import { redisClient } from "../config/redisClient.js";
import { messageReqProducer } from "../kafka/producers/messageReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { messageResConsumer } from "../kafka/consumers/messageResConsumer.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { redisClient } from "../config/redisClient.js";

messageReqProducer.connect();
export let messageController = {};

// @route POST api/messages/sendMessage
// @desc send a message to other user
// @access Private
messageController.sendMessage = (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  console.log(
    JSON.stringify({
      id: requestId,
      action: "sendMessage",
      params: req.params,
      body: req.body,
      user: req.user,
    })
  );
  messageReqProducer.send({
    topic: "messages_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "sendMessage",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // messageController.sendMessage = async (req, res) => {
  // try {
  //   const { toUserId, text } = req.body;
  //   let message = new Message({ toUserId, fromUserId:req.user.id, text });
  //   await message
  //     .save()
  //     .then((doc) =>
  //       doc
  //         .populate('toUserId', 'firstName')
  //         .populate('fromUserId', 'firstName')
  //         .execPopulate()
  //     );

  //   redisClient.get(req.user.id, async (err, data) => {
  //     // If value for key is available in Redis
  //     if (data) {
  //       data = JSON.parse(data);
  //       const updatedData = [...data, message];
  //       redisClient.setex(req.user.id, 3000, JSON.stringify(updatedData));
  //     }
  //     // If value for given key is not available in Redis
  //     else {
  //       await Message.find({
  //         $or : [{ toUserId: req.user.id }, { fromUserId: req.user.id }] })
  //         .populate('toUserId', 'firstName')
  //         .populate('fromUserId', 'firstName')
  //         .then((messages) => {
  //           const msg = JSON.stringify(messages);
  //           redisClient.setex(req.user.id, 36000, msg);
  //     })
  //     }
  //   });

  //   redisClient.get(toUserId, async (err, data) => {
  //     // If value for key is available in Redis
  //     if (data) {
  //       data = JSON.parse(data);
  //       const updatedData = [...data, message];
  //       redisClient.setex(toUserId, 3000, JSON.stringify(updatedData));
  //     }
  //     // If value for given key is not available in Redis
  //     else {
  //       await Message.find({
  //         $or : [{ toUserId }, { fromUserId: toUserId }] })
  //         .populate('toUserId', 'firstName')
  //         .populate('fromUserId', 'firstName')
  //         .then((messages) => {
  //           const msg = JSON.stringify(messages);
  //           redisClient.setex(toUserId, 36000, msg);
  //     })
  //       await Message.find()
  //         .or([{ toUserId: req.user.id }, { fromUserId: req.user.id }])
  //         .populate('toUserId', 'firstName')
  //         .populate('fromUserId', 'firstName')
  //         .then((messages) => {
  //           redisClient.setex(req.user.id, 3000, JSON.stringify(messages));
  //         });
  //     }
  //   });

  //   res.send(message);
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send('Server error');
  // }
};

// @route GET api/messages/
// @desc get all conversation specific to a user
// @access Private
messageController.getMessages = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  console.log(
    JSON.stringify({
      id: requestId,
      action: "getMessages",
      params: req.params,
      user: req.user,
    })
  );
  messageReqProducer.send({
    topic: "messages_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "getMessages",
          params: req.params,
          user: req.user,
        }),
      },
    ],
  });

  //   try {
  //     redisClient.get(req.user.id, async (err, data) => {
  //       // If value for key is available in Redis
  //       if (data) {
  //         res.send(data);
  //       }
  //       // If value for given key is not available in Redis
  //       else {
  //         await Message.find({
  //           $or : [{ toUserId: req.user.id }, { fromUserId: req.user.id }] })
  //           .populate('toUserId', 'firstName')
  //           .populate('fromUserId', 'firstName')
  //           .then((messages) => {
  //             const msg = JSON.stringify(messages);
  //             redisClient.setex(req.user.id, 36000, msg);
  //             res.send(msg);
  //       })
  //     }
  //   })
  // } catch (error) {
  //     console.log(error);
  //     res.status(500).send('Server error');
  //   }
};

// @route GET api/messages/find
// @desc search for other users
// @access Private
messageController.findUser = async (req, res) => {
  const { userName } = req.body;
  try {
    const users = await User.find(
      {
        $or: [
          { firstName: { $regex: userName, $options: "i" } },
          { lastName: { $regex: userName, $options: "i" } },
        ],
      },
      { firstName: 1, lastName: 1, email: 1, profilePicture: 1 }
    );
    res.send(users);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};
