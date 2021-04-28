import dotenv from 'dotenv';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { S3 } from '../config/s3.js';
import { sqlDB } from '../config/queries.js';
import uuid from 'uuid';
dotenv.config({ path: '.env' });

export let communityController = {};

// @route POST api/mycommunity/create
// @desc create new community
// @access Private
communityController.create = async (req, res) => {
  const { communityName, description, rules } = req.body;
  try {
    const checkUniqueName = await Community.findOne({ communityName });
    if (checkUniqueName) {
      return res.status(400).json({
        errors: [{ msg: `${communityName} community already exists.` }],
      });
    }
    const newCommunity = new Community({
      communityName,
      creatorID: req.user.id,
    });

    if (description) {
      newCommunity.description = description;
    }

    if (req.files) {
      const files = req.files;

      const locationPromises = files.map(async (item) => {
        let myFile = item.originalname.split('.');
        let fileType = myFile[myFile.length - 1];
        let params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `${uuid()}.${fileType}`,
          Body: item.buffer,
        };

        const resp = await S3.upload(params).promise();
        return resp.Location;
      });
      const imageLinks = await Promise.all(locationPromises);
      newCommunity.images = imageLinks;
    }

    await newCommunity.save();
    const communityID = newCommunity._id;

    if (rules) {
      const parsedRules = JSON.parse(rules);
      await Community.findByIdAndUpdate(
        communityID,
        { $set: { rules: parsedRules } },
        { new: true }
      );
    }
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { communities: communityID },
    });
    res.json('Community created');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route PUT api/mycommunity/:community_id
// @desc update community
// @access Private
communityController.updateCommunity = async (req, res) => {
  const { description, rules } = req.body;
  const communityFields = {};
  if (description) {
    communityFields.description = description;
  }
  if (rules) {
    const parsedRules = JSON.parse(rules);
    communityFields.rules = parsedRules;
  }

  try {
    await Community.findByIdAndUpdate(req.params.community_id, {
      $set: communityFields,
    });
    res.json('Community updated');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route GET api/mycommunity/
// @desc get list of communities
// @access Private
communityController.getAllMyCommunities = async (req, res) => {
  try {
    const myCommunities = await Community.find({ creatorID: req.user.id });

    const communityInfo = myCommunities.map((community) => {
      return {
        communityName: community.communityName,
        description: community.description,
        postsCount: community.posts.length,
        createdDate: community.createdDate,
        subscribersCount: community.subscribers.length,
        images: community.images,
        communityId: community._id,
      };
    });

    res.json(communityInfo);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route DELETE api/mycommunity/:community_id
// @desc delete a community
// @access Private
communityController.deleteCommunity = async (req, res) => {
  try {
    const deletedCommunity = await Community.findByIdAndDelete(
      req.params.community_id
    );
    await sqlDB.deletePosts(deletedCommunity.id);

    res.json('community deleted');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};