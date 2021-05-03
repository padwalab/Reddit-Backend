import { sqlDB } from "../config/queries.js";

export let postController = {};

// @route POST api/post
// @desc add post in a community
// @access Private
postController.addPost = async (req, res) => {
  const {communityId, image, link, text, title, type, creatorName } = req.body;
  try {
    const result = await sqlDB.addPost(req.user.id, communityId, image, text, link, type, title, creatorName);
    if (result.affectedRows > 0) res.status(200).send("Post Added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

// @route DELETE api/post
// @desc delete post in a community
// @access Private
postController.deletePost = async (req, res) => {
  const { id } = req.body;
  try {
    const result = await sqlDB.deletePost(id);
    if (result.affectedRows > 0) res.status(200).send("Post Deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

// @route POST api/post/vote
// @desc add vote for a comment
// @access Private
postController.addVote = async (req, res) => {
  const {postId, vote} = req.body;
  try{
    const result = await sqlDB.addPostVote(postId, req.user.id, vote);
    if(result.affectedRows > 0) res.status(200).send("Voted");
  }catch (error){
    console.log(error);
    res.status(500).send("Server error");
  }
}

// @route GET api/post/vote
// @desc get all votes of a comment
// @access Private
postController.voteCount = async (req, res) => {
  const {postId} = req.body;
  try{
  const result = await sqlDB.getPostVoteCount(postId, req.user.id);
    res.status(200).send(result);
  }catch (error){
  res.status(200).send("Server error");
 }
}
