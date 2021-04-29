import { sqlDB } from "../config/queries.js";

export let commentController = {};

// @route POST api/comment/
// @desc add new comment
// @access Private
commentController.addComment = async (req, res) => {
  const { postId, text, creatorId, parentId } = req.body;

  const result = await sqlDB.InsertComment(
    postId,
    text,
    creatorId,
    parentId
  );
  if(result.affectedRows > 0)
  res.status(200).send('Added Comment');
};

// @route DELETE api/comment/:commentId
// @desc delete a comment and its sub-Comments
// @access Private
commentController.deleteComment = async (req, res) => {
  const childIds = await sqlDB.getChildCommentIDs(req.params.commentId);
  const ids = childIds.map((ele) => ele.childId);
  const result = await sqlDB.deleteSubComments(ids);
  if(result.affectedRows > 0)
  res.status(200).send('Deleted comment');
};
