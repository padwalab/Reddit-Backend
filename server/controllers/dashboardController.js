import { sqlDB } from '../config/queries.js';
import Community from '../models/Community.js';
import _ from 'lodash';
import { findFor, findInArray } from '../../utils/createNestedObject.js';

export let dashboardController = {};

// @route GET api/dashboard/
// @desc get all posts along with comments
// @access Private
dashboardController.getAllPosts = async (req, res) => {
  try {
    const myCommunities = await Community.find(
      { creatorID: req.user.id },
      { id: 1 }
    );
    const rootPromises = myCommunities.map(async (ele) => {
      const allPosts = await sqlDB.getAllPosts(ele.id);

      const z = {};

      const rcs = await sqlDB.getRootCommentIds(ele.id);
      if (rcs.length) {
        const promiseComments = rcs.map(
          async (e) => await sqlDB.getAllComments(e.id)
        );
        const allComments = await Promise.all(promiseComments);

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

        const postIds = Object.keys(groupedCommentsByPostId);

        const nestedObject = postIds.map((postId) => {
          return {
            post: findInArray(allPosts, parseInt(postId)),
            comments: findFor(
              null,
              groupedChildParentByPostId[postId],
              groupedCommentsByPostId[postId]
            ),
          };
        });

        z[ele.id] = nestedObject;
      } else {
        z[ele.id] = allPosts;
      }

      return z;
    });
    const nestedComments = await Promise.all(rootPromises);
    res.json(nestedComments);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
