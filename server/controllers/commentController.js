import { sqlDB } from '../config/queries.js';
import Community from '../models/Community.js';
import _ from 'lodash';
import { findFor, findInArray } from '../../utils/createNestedObject.js';
export let commentController = {};

// @route POST api/comment/
// @desc add new comment
// @access Private
commentController.addComment = async (req, res) => {
  const { postId, text, parentId } = req.body;
  try {
    const result = await sqlDB.insertComment(
      postId,
      text,
      req.user.id,
      parentId,
      req.user.firstName
    );
    if (result.affectedRows > 0) res.status(200).send('Added Comment');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route DELETE api/comment/
// @desc delete a comment and its sub-Comments
// @access Private
commentController.deleteComment = async (req, res) => {
  const { commentId } = req.body;
  try {
    const childIds = await sqlDB.getChildCommentIDs(commentId);
    const ids = childIds.map((ele) => ele.childId);
    const result = await sqlDB.deleteSubComments(ids);
    if (result.affectedRows > 0) res.status(200).send('Deleted comment');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route GET api/comment/
// @desc get all comments along with its sub-Comments
// @access Private
commentController.getComments = async (req, res) => {
  try {
    const myCommunities = await Community.find(
      { creatorID: req.user.id },
      { id: 1 }
    );
    const rootPromises = myCommunities.map(async (ele) => {
      const z = {};

      const rcs = await sqlDB.getRootCommentIds(ele.id);
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
      const allPosts = await sqlDB.getAllPosts(ele.id);

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
      return z;
    });
    const nestedComments = await Promise.all(rootPromises);
    res.json(nestedComments);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route POST api/comment/vote
// @desc add vote for a comment
// @access Private
commentController.addVote = async (req, res) => {
  const {commentId, vote, userId} = req.body;
  let result ={};
  try{
    if(userId === req.user.id){
    result = await sqlDB.addCommentVote(commentId, userId, vote, true);
    }
    else {
      result = await sqlDB.addCommentVote(commentId, userId, vote, false);
    }
    if(result.affectedRows > 0) res.status(200).send("Voted");
  }catch (error){
    console.log(error);
    res.status(500).send("Server error");
  }
}

// @route GET api/comment/vote
// @desc get all votes of a comment
// @access Private
commentController.voteCount = async  (req, res) => {
  const {commentId} = req.body;
  try{
  const result = await sqlDB.getCommentVoteCount(commentId, req.user.id);
    res.status(200).send(result);
  }catch (error){
  res.status(200).send("Server error");
 }
}