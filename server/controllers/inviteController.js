import Invite from "../models/Invite.js";

export let inviteController = {};

// @route POST api/invites/userInvite
// @desc Invite user
// @access Public
inviteController.inviteUser = async (req, res) => {
  const { community, user, date } = req.body;

  let invite = await Invite.findOne({ community, user });

  if (invite) {
    return res.status(400).json({
      errors: [{ msg: `Invite is already sent to the user.` }],
    });
  }
  invite = new Invite({ community, user, date });
  invite.save();
  res.status(200).send(`Invite sent successfully`);
};

// @route GET api/invites/communityInvites
// @desc List of invites sent by community moderator to users
// @access Public
inviteController.loadCommunityInvites = async (req, res) => {
  const { community } = req.body;

  let invites = await Invite.find({ community });
  return res.status(`200`).send(invites);
};

// @route GET api/invites/userInvites
// @desc List of invites received by user
// @access Public
inviteController.loadUserInvites = async (req, res) => {
  const { user } = req.body;

  let invites = await Invite.find({ user });
  return res.status(`200`).send(invites);
};

// @route DELETE api/invites/inviteAction
// @desc Accept/Reject for an invite
// @access Public
inviteController.inviteAction = async (req, res) => {
  const { user, community, status } = req.body;

  //delete the invite
  await Invite.deleteOne({ user, community });
  if (status === "Accept") {
    // to-do Add to subscriber list of the community
  }
  return res.status(`200`).send("Invite Deleted");
};
