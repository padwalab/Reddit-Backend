import Invite from "../models/Invite.js";
import Community from "../models/Community.js";
import mongoose from 'mongoose';

export let inviteController = {};

// @route POST api/invites/userInvite
// @desc Invite user
// @access Public
inviteController.inviteUser = async (req, res) => {
  const { communityId, userIds, date } = req.body;
  const resultPromises = userIds.map(async(userId) => {
    let obj = await Community.find({
      _id: communityId, subscribers: mongoose.Types.ObjectId(userId),
    });
    if(obj.length > 0){
      return {
        id:userId,
        message:`User is already part of the community.`
      }
    }
    else{
    const findInvite = await Invite.findOne({ communityId, userId });
    if(findInvite){
      return {
        id:userId,
        message : `Invite is already sent to the user.`
      }
    }
    else{
      const invite = new Invite({ communityId, userId, date });
      invite.save();
      return {
        id:userId,
        message:`Invite sent to user.`
      }
    }
  }
})
  const result = await Promise.all(resultPromises);
  res.json(result);
};

// @route GET api/invites/communityInvites
// @desc List of invites sent by community moderator to users
// @access Public
inviteController.loadCommunityInvites = async (req, res) => {
  const { communityId } = req.body;
  let invites = await Invite.find({ communityId }).populate({ path: 'userId', select: ['firstName','lastName'] });
  return res.status(`200`).send(invites);
};

// @route GET api/invites/userInvites
// @desc List of invites received by user
// @access Public
inviteController.loadUserInvites = async (req, res) => {
  let invites = await Invite.find({userId:req.user.id}).populate({ path: 'communityId', select: ['communityName'] })
  return res.status(`200`).send(invites);
};

// @route DELETE api/invites/inviteAction
// @desc Accept/Reject for an invite
// @access Public
inviteController.inviteAction = async (req, res) => {
  const { communityId, status } = req.body;
  let msg;
  
  //delete the invite
  await Invite.deleteOne({ userId:req.user.id, communityId });
  if (status === "Accept") {
    let obj = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { subscribers: req.user.id } },
      { new: true }
    );
    if (obj) {
      msg = obj;
    }
  }
  if (status === "Reject") {
    msg = "User rejected";
  }
  return res.status(`200`).send(msg);
};
