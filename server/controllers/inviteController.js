import Invite from "../models/Invite.js";
import Community from "../models/Community.js";

export let inviteController = {};

// @route POST api/invites/userInvite
// @desc Invite user
// @access Public
inviteController.inviteUser = async (req, res) => {
  const { communityId, userId, date } = req.body;

  let invite = await Invite.findOne({ communityId, userId });

  if (invite) {
    return res.status(400).json({
      errors: [{ msg: `Invite is already sent to the user.` }],
    });
  }
  invite = new Invite({ communityId, userId, date });
  invite.save();
  res.json(invite);
};

// @route GET api/invites/communityInvites
// @desc List of invites sent by community moderator to users
// @access Public
inviteController.loadCommunityInvites = async (req, res) => {
  const { communityId } = req.body;

  let invites = await Invite.find({ communityId });
  return res.status(`200`).send(invites);
};

// @route GET api/invites/userInvites
// @desc List of invites received by user
// @access Public
inviteController.loadUserInvites = async (req, res) => {
  const { userId } = req.body;

  let invites = await Invite.find({ userId });
  return res.status(`200`).send(invites);
};

// @route DELETE api/invites/inviteAction
// @desc Accept/Reject for an invite
// @access Public
inviteController.inviteAction = async (req, res) => {
  const { userId, communityId, status } = req.body;
  let msg;

  //delete the invite
  await Invite.deleteOne({ userId, communityId });
  if (status === "Accept") {
    let obj = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { subscribers: userId } },
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
