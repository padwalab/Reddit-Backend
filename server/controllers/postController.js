import { sqlDB } from '../config/queries.js';
import Community from '../models/Community.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { S3 } from '../config/s3.js';
import uuid from 'uuid';
import _ from 'lodash';
import { findFor } from '../../utils/createNestedObject.js';

export let postController = {};

// @route POST api/post
// @desc add post in a community
// @access Private
postController.addPost = async (req, res) => {
  let { communityId, content, title, type } = req.body;
  try {
    if (req.files.length > 0) {
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
      });
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
    if (result.affectedRows > 0) {
      await Community.findByIdAndUpdate(
        communityId,
        { $push: { posts: result.insertId } },
        { safe: true, upsert: true }
      );
      const post = await sqlDB.getRecentPost(result.insertId);
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
    if (result.affectedRows > 0) {
      const community = await Community.findByIdAndUpdate(
        communityId,
        { $pull: { posts: postId } },
        { safe: true, upsert: true }
      );
      res.status(200).send('Post Deleted');
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

// @route GET api/post/:id
// @desc get post along with comments given postID
// @access Private
postController.getPostById = async (req, res) => {
  try {
    let obj = [];
    obj.push({ post: await sqlDB.getPostByID(req.params.id) });
    obj.push({
      postVotes: await sqlDB.getPostVoteCount(req.params.id, req.params.userID),
    });
    const rcs = await sqlDB.getRootCommentIds(
      req.params.communityID,
      req.params.id
    );

    if (rcs.length) {
      let cv = new Object();
      const promiseComments = rcs.map(async (e) => {
        obj.push({
          [e.id]: await sqlDB.getCommentVoteCount(e.id, req.params.userID),
        });

        return await sqlDB.getAllComments(e.id);
      });
      const allComments = await Promise.all(promiseComments);
      obj.push({ numberOfComments: allComments.flat(1).length });

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

      obj.push({
        comments: findFor(
          null,
          groupedChildParentByPostId[req.params.id],
          groupedCommentsByPostId[req.params.id]
        ),
      });
    }

    res.json(obj);
  } catch (error) {
    console.log(error);
    res.status(200).send('Server error');
  }
};
