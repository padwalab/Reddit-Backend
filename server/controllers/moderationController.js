import dotenv from 'dotenv';
import Community from '../models/Community.js';
import { sqlDB } from '../config/queries.js';
import User from '../models/User.js';
dotenv.config({ path: '.env' });

export let commModerationController = {};

// @route GET api/moderator/
// @desc get list of communities and requests to join
// @access Private
commModerationController.getListOfCommunities = async (req, res) => {
  try {
    const myCommunities = await Community.find(
      { creatorID: req.user.id },
      { communityName: 1, joinRequests: 1, subscribers: 1 }
    )
      .populate({
        path: 'joinRequests subscribers',
        select: [
          'firstName',
          'lastName',
          'email',
          'profilePicture',
          'gender',
          'aboutMe',
          'communities',
        ],
      })
      .populate({ path: 'communities', select: ['communityName'] });

    const communityInfo = myCommunities.map((community) => {
      return {
        communityId: community.id,
        communityName: community.communityName,
        noOfJoinReqs: community.joinRequests.length,
        joinReqs: community.joinRequests,
        subscribers: community.subscribers,
      };
    });

    res.json(communityInfo);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route POST api/moderator/
// @desc accept join requests
// @access Private
commModerationController.acceptJoinReqs = async (req, res) => {
  try {
    const { communityId, userList } = req.body;
    await Community.findByIdAndUpdate(communityId, {
      $addToSet: { subscribers: { $each: userList } },
      $pull: { joinRequests: { $in: userList } },
    });

    await User.updateMany(
      { _id: { $in: userList } },
      {
        $addToSet: { communities: communityId },
      }
    );

    res.json('join requests accepted');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route DELETE api/moderator/
// @desc delete user from list of communities
// @access Private
commModerationController.deleteUserFromCommunities = async (req, res) => {
  try {
    const { userID, communityList } = req.body;
    await User.findByIdAndUpdate(userID, {
      $pull: { communities: { $in: communityList } },
    });
    await Community.updateMany(
      { _id: { $in: communityList } },
      {
        $pull: { subscribers: userID },
      }
    );

    await sqlDB.deletePostBycreatorID(userID, communityList);
    const ids = await sqlDB.getAllPostsFromCommList(communityList);
    const id_list = ids.map((ele) => ele.id);
    await sqlDB.deleteCommentsByUserId(userID, id_list);

    res.json('user removed from selected communities');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
