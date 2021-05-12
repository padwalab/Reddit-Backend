import dotenv from 'dotenv';
import Community from '../models/Community.js';
import { sqlDB } from '../config/queries.js';
import _ from 'lodash';
dotenv.config({ path: '.env' });

export let communityHomeController = {};

// @route POST api/community-home/join-community
// @desc get list of communities and requests to join
// @access Private
communityHomeController.requestToJOin = async (req, res) => {
  const { communityId } = req.body;
  try {
    await Community.findByIdAndUpdate(communityId, {
      $addToSet: { joinRequests: req.user.id },
    });

    res.json('join request sent');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route GET api/community-home/:communityId/:userId
// @desc get community details
// @access Private
communityHomeController.getCommunityInfo = async (req, res) => {
  try {
    const myCommunity = await Community.findById(
      req.params.communityId
    ).populate({ path: 'creatorID', select: ['firstName'] });
    let buttonDisplay = '';

    if (
      req.params.userId !== 'null' &&
      String(myCommunity.creatorID.id) !== req.params.userId
    ) {
      console.log('here');
      const sub = myCommunity.subscribers.includes(req.params.userId);

      if (sub) {
        buttonDisplay = 'Leave';
      } else {
        const join = myCommunity.joinRequests.includes(req.params.userId);
        if (join) {
          buttonDisplay = 'Waiting For Approval';
        } else {
          buttonDisplay = 'Join';
        }
      }
    }
    const posts = await sqlDB.getAllPosts(req.params.communityId);
    const nestedObject = posts.map(async (post) => {
      let obj = new Object();
      obj['post'] = post;
      obj.post['postVotes'] = await sqlDB.getPostVoteCount(
        post.id,
        req.params.userId
      );
      return obj;
    });
    const allPosts = await Promise.all(nestedObject);
    res.json({
      id: myCommunity.id,
      communityName: myCommunity.communityName,
      creatorName: myCommunity.creatorID.firstName,
      description: myCommunity.description,
      postsCount: myCommunity.posts.length,
      createdDate: myCommunity.createdDate,
      subscribersCount: myCommunity.subscribers.length,
      images: myCommunity.images,
      upvotes: myCommunity.upvotes.length,
      downvotes: myCommunity.downvotes.length,
      rules: myCommunity.rules,
      buttonDisplay,
      posts: allPosts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route DELETE api/community-home/
// @desc Leave community
// @access Private
communityHomeController.leaveCommunity = async (req, res) => {
  const { communityId } = req.body;
  try {
    await Community.findByIdAndUpdate(communityId, {
      $pull: { subscribers: req.user.id },
    });

    res.json('left from community');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
