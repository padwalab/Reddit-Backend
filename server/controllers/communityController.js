import dotenv from "dotenv";
import Community from "../models/Community.js";
import User from "../models/User.js";
import { S3 } from "../config/s3.js";
import { sqlDB } from "../config/queries.js";
import uuid from "uuid";
import mongoose from "mongoose";
import { communityReqProducer } from "../kafka/producers/communityReqProducer.js";
dotenv.config({ path: ".env" });
import { responses } from "../kafka/kafka.js";
import { communityResConsumer } from "../kafka/consumers/communityResConsumer.js";
communityReqProducer.connect();
export let communityController = {};

// @route POST api/mycommunity/create
// @desc create new community
// @access Private
communityController.create = async (req, res) => {
  const files = req.files;

  const locationPromises = files.map(async (item) => {
    let myFile = item.originalname.split(".");
    let fileType = myFile[myFile.length - 1];
    let params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}.${fileType}`,
      Body: item.buffer,
    };

    const resp = await S3.upload(params).promise();
    return resp.Key;
  });
  const imageLinks = await Promise.all(locationPromises);

  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communityReqProducer.send({
    topic: "community_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "create",
          params: req.params,
          body: req.body,
          user: req.user,
          files: imageLinks,
        }),
      },
    ],
  });
  // const { communityName, description, rules } = req.body;
  // try {
  //   const checkUniqueName = await Community.findOne({ communityName });
  //   if (checkUniqueName) {
  //     return res.status(400).json({
  //       errors: [{ msg: `${communityName} community already exists.` }],
  //     });
  //   }
  //   const newCommunity = new Community({
  //     communityName,
  //     creatorID: req.user.id,
  //   });

  //   if (description) {
  //     newCommunity.description = description;
  //   }

  //   if (req.files) {
  //     const files = req.files;

  //     const locationPromises = files.map(async (item) => {
  //       let myFile = item.originalname.split(".");
  //       let fileType = myFile[myFile.length - 1];
  //       let params = {
  //         Bucket: process.env.AWS_BUCKET_NAME,
  //         Key: `${uuid()}.${fileType}`,
  //         Body: item.buffer,
  //       };

  //       const resp = await S3.upload(params).promise();
  //       return resp.Key;
  //     });
  //     const imageLinks = await Promise.all(locationPromises);
  //     newCommunity.images = imageLinks;
  //   }

  //   await newCommunity.save();
  //   const communityID = newCommunity._id;

  //   if (rules) {
  //     const parsedRules = JSON.parse(rules);
  //     await Community.findByIdAndUpdate(
  //       communityID,
  //       { $set: { rules: parsedRules } },
  //       { new: true }
  //     );
  //   }
  //   await User.findByIdAndUpdate(req.user.id, {
  //     $addToSet: { communities: communityID },
  //   });
  //   res.json("Community created");
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send("Server error");
  // }
};

// @route PUT api/mycommunity/:community_id
// @desc update community
// @access Private
communityController.updateCommunity = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communityReqProducer.send({
    topic: "community_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "updateCommunity",
          params: req.params,
          body: req.body,
          files: req.files,
        }),
      },
    ],
  });
  // const { description, rules } = req.body;
  // const communityFields = {};
  // if (description) {
  //   communityFields.description = description;
  // }
  // if (rules) {
  //   const parsedRules = JSON.parse(rules);
  //   communityFields.rules = parsedRules;
  // }

  // try {
  //   await Community.findByIdAndUpdate(req.params.community_id, {
  //     $set: communityFields,
  //   });
  //   res.json("Community updated");
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send("Server error");
  // }
};

// @route GET api/mycommunity/
// @desc get list of communities
// @access Private
communityController.getAllMyCommunities = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communityReqProducer.send({
    topic: "community_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "getAllMyCommunities",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // try {
  //   const myCommunities = await Community.find({ creatorID: req.user.id });

  //   const communityInfo = myCommunities.map((community) => {
  //     return {
  //       id: community.id,
  //       communityName: community.communityName,
  //       description: community.description,
  //       postsCount: community.posts.length,
  //       createdDate: community.createdDate,
  //       subscribersCount: community.subscribers.length,
  //       images: community.images,
  //       upvotes: community.upvotes.length,
  //       downvotes: community.downvotes.length,
  //       rules: community.rules,
  //       difference: Math.abs(
  //         community.upvotes.length - community.downvotes.length
  //       ),
  //     };
  //   });

  //   res.json(communityInfo);
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send("Server error");
  // }
};

// @route DELETE api/mycommunity/:community_id
// @desc delete a community
// @access Private
communityController.deleteCommunity = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communityReqProducer.send({
    topic: "community_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "deleteCommunity",
          params: req.params,
        }),
      },
    ],
  });
  // try {
  //   const deletedCommunity = await Community.findByIdAndDelete(
  //     req.params.community_id
  //   );

  //   await sqlDB.deletePosts(deletedCommunity.id);
  //   res.json("deleted");
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send("Server error");
  // }
};

// @route POST api/mycommunity/vote
// @desc vote for a community
// @access Private
communityController.addVote = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communityReqProducer.send({
    topic: "community_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "addVote",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });

  // const { communityId, vote } = req.body;
  // let obj = await Community.find({
  //   downvotes: mongoose.Types.ObjectId(req.user.id),
  // });
  // let obj2 = await Community.find({
  //   upvotes: mongoose.Types.ObjectId(req.user.id),
  // });
  // if (obj.length === 0 && obj2.length === 0) {
  //   try {
  //     if (vote === 1) {
  //       await Community.findByIdAndUpdate(
  //         communityId,
  //         { $push: { upvotes: req.user.id } },
  //         { new: true, upsert: true },
  //         function (err, community) {
  //           if (err) return console.log(err);
  //           res.json(community);
  //         }
  //       );
  //     } else {
  //       await Community.findByIdAndUpdate(
  //         communityId,
  //         { $push: { downvotes: req.user.id } },
  //         { new: true, upsert: true },
  //         function (err, community) {
  //           if (err) return console.log(err);
  //           res.json(community);
  //         }
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).send("Server error");
  //   }
  // } else {
  //   res.status(500).send("user already voted");
  // }
};
