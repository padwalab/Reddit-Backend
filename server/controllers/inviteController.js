import Invite from "../models/Invite.js";
import Community from "../models/Community.js";
import mongoose from "mongoose";
import User from "../models/User.js";

import { inviteReqProducer } from "../kafka/producers/inviteReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { inviteResConsumer } from "../kafka/consumers/inviteResConsumer.js";

// userConsumer.start();
inviteReqProducer.connect();

export let inviteController = {};

// @route POST api/invites/userInvite
// @desc Invite user
// @access Public
inviteController.inviteUser = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  inviteReqProducer.send({
    topic: "invite_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "inviteUser",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // const { communityId, userId, date } = req.body;
  // let invite = await Invite.findOne({ communityId, userId });
  // if (invite) {
  //   return res.status(400).json({
  //     errors: [{ msg: `Invite is already sent to the user.` }],
  //   });
  // }
  // invite = new Invite({ communityId, userId, date });
  // invite.save();
  // res.json(invite);
};

// @route GET api/invites/communityInvites
// @desc List of invites sent by community moderator to users
// @access Public
inviteController.loadCommunityInvites = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  inviteReqProducer.send({
    topic: "invite_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "loadCommunityInvites",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // const { communityId } = req.body;

  // let invites = await Invite.find({ communityId });
  // return res.status(`200`).send(invites);
};

// @route GET api/invites/userInvites
// @desc List of invites received by user
// @access Public
inviteController.loadUserInvites = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  inviteReqProducer.send({
    topic: "invite_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "loadUserInvites",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // let invites = await Invite.find({ userId: req.user.id });
  // return res.status(`200`).send(invites);
};

// @route DELETE api/invites/inviteAction
// @desc Accept/Reject for an invite
// @access Public
inviteController.inviteAction = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  inviteReqProducer.send({
    topic: "invite_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "inviteAction",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // const { communityId, status } = req.body;
  // let msg;

  // //delete the invite
  // await Invite.deleteOne({ userId: req.user.id, communityId });
  // if (status === "Accept") {
  //   let obj = await Community.findByIdAndUpdate(
  //     communityId,
  //     { $addToSet: { subscribers: req.user.id } },
  //     { new: true }
  //   );
  //   if (obj) {
  //     msg = obj;
  //   }
  // }
  // if (status === "Reject") {
  //   msg = "User rejected";
  // }
  // return res.status(`200`).send(msg);
};
