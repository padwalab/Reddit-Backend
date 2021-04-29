import { sqlDB } from '../config/queries.js';

export let commentController = {};

// @route POST api/comment/
// @desc add new comment
// @access Private
commentController.addComment = async (req, res) => {
  const { postId, text, creatorId, parentId } = req.body;
  try {
    const result = await sqlDB.InsertComment(postId, text, creatorId, parentId);
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
