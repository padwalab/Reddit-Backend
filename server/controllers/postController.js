import { sqlDB } from '../config/queries.js';
import Community from '../models/Community.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { S3 } from '../config/s3.js';
import uuid from 'uuid';

export let postController = {};

// @route POST api/post
// @desc add post in a community
// @access Private
postController.addPost = async (req, res) => {
  let { communityId, content, title, type } = req.body;
  try {
    if (req.files) {
    content = req.files;
      const locationPromises = content.map(async (item) => {
        let myFile = item.originalname.split('.');
        let fileType = myFile[myFile.length - 1];
        let params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${uuid()}.${fileType}`,
          Body: item.buffer,
        };
        const resp = await S3.upload(params).promise();
        return resp.Key;
      })
     const contentPromises = await Promise.all(locationPromises);
     content = contentPromises.join();
    }
    const result = await sqlDB.addPost(
      req.user.id,
      communityId,
      content,
      type,
      title,
      req.user.firstName
    );
    if (result.affectedRows > 0){
      await Community.findByIdAndUpdate(
        communityId,
        { $push: { posts: result.insertId } },
        {safe: true, upsert: true});
        const post = await sqlDB.getRecentPost();
        res.send(post); 
    } 
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route DELETE api/post
// @desc delete post in a community
// @access Private
postController.deletePost = async (req, res) => {
  const { postId, communityId } = req.body;
  try {
    const result = await sqlDB.deletePost(postId);
    if (result.affectedRows > 0){
    const community = await Community.findByIdAndUpdate(communityId,
        {$pull: {posts: postId}},
        {safe: true, upsert: true});
       res.status(200).send("Post Deleted");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route POST api/post/vote
// @desc add vote for a comment
// @access Private
postController.addVote = async (req, res) => {
  const { postId, vote } = req.body;
  try {
    const result = await sqlDB.addPostVote(postId, req.user.id, vote);
    if (result.affectedRows > 0) res.status(200).send('Voted');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route GET api/post/vote
// @desc get all votes of a post
// @access Private
postController.voteCount = async (req, res) => {
  const { postId } = req.body;
  try {
    const result = await sqlDB.getPostVoteCount(postId, req.user.id);
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send('Server error');
  }
};
