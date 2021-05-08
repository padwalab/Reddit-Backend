import dotenv from 'dotenv';
import Community from '../models/Community.js';
import _ from 'lodash';
import { findFor, findInArray } from '../../utils/createNestedObject.js';
import { sqlDB } from '../config/queries.js';

dotenv.config({ path: '.env' });

export const getPosts = async (communityID, userId) => {
  const allPosts = await sqlDB.getAllPosts(communityID);

  const z = {};
  const nestedObject = allPosts.map(async (post) => {
    let obj = new Object();
    obj['post'] = post;
    obj.post['postVotes'] = await sqlDB.getPostVoteCount(post.id, userId);
    const rcs = await sqlDB.getRootCommentIds(communityID, post.id);

    if (rcs.length) {
      const promiseComments = rcs.map(
        async (e) => await sqlDB.getAllComments(e.id)
      );
      const allComments = await Promise.all(promiseComments);
      obj.post['numberOfComments'] = allComments.flat(1).length;

      const promiseSeq = rcs.map(async (e) => await sqlDB.getSequences(e.id));
      const allSeq = await Promise.all(promiseSeq);

      const childParent = allSeq.flat(1).map((e) => {
        const p = e.seq.split(',');
        return {
          pid: e.postId,
          id: e.id,
          parent: parseInt(p[p.length - 2]) || null,
        };
      });
      const groupedChildParentByPostId = _.mapValues(
        _.groupBy(childParent, 'pid'),
        (cplist) => cplist.map((cp) => _.omit(cp, 'pid'))
      );
      const groupedCommentsByPostId = _.mapValues(
        _.groupBy(allComments.flat(1), 'postId'),
        (clist) => clist.map((comment) => _.omit(comment, 'postId'))
      );

      obj.post['comments'] = findFor(
        null,
        groupedChildParentByPostId[post.id],
        groupedCommentsByPostId[post.id]
      );
    }
    return obj;
  });

  z[communityID] = await Promise.all(nestedObject);
  return z;
};

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

// @route GET api/community-home/:communityId
// @desc get community details
// @access Private
communityHomeController.getCommunityInfo = async (req, res) => {
  try {
    const myCommunity = await Community.findById(req.params.communityId);
    const sub = myCommunity.subscribers.includes(req.user.id);
    let buttonDisplay;
    if (sub) {
      buttonDisplay = 'Leave';
    } else {
      const join = myCommunity.joinRequests.includes(req.user.id);
      if (join) {
        buttonDisplay = 'Waiting For Approval';
      } else {
        buttonDisplay = 'Join';
      }
    }
    const posts = await Promise.all(
      getPosts(req.params.communityId, req.user.id)
    );
    res.json({
      id: myCommunity.id,
      communityName: myCommunity.communityName,
      description: myCommunity.description,
      postsCount: myCommunity.posts.length,
      createdDate: myCommunity.createdDate,
      subscribersCount: myCommunity.subscribers.length,
      images: myCommunity.images,
      upvotes: myCommunity.upvotes.length,
      downvotes: myCommunity.downvotes.length,
      rules: myCommunity.rules,
      buttonDisplay,
      posts,
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
