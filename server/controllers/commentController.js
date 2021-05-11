import { sqlDB } from '../config/queries.js';
import _ from 'lodash';
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
    if (result.affectedRows > 0){
        const comment = await sqlDB.getRecentComment();
        res.send(comment);
    }
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