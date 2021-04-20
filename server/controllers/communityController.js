import dotenv from 'dotenv';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { S3 } from '../config/s3.js';
import uuid from 'uuid';
dotenv.config({ path: '.env' });

export let communityController = {};

// @route POST api/mycommunity/create
// @desc create new community
// @access Private
communityController.create = async (req, res) => {
  let filepath;
  const { communityName, description, rules } = req.body;
  try {
    if (req.file) {
      const myFile = req.file.originalname.split('.');
      const fileType = myFile[myFile.length - 1];

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer,
      };

      S3.upload(params, (error, data) => {
        if (error) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Error uploading file' }] });
        }
      });

      filepath = params.Key;
    }

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
    if (filepath) {
      newCommunity.comProfilePicture = filepath;
    }
    if (description) {
      newCommunity.description = description;
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
// communityController.getAllMyCommunities = async (req, res) => {
//     try {
//      const deletedCommunity = await Community.findByIdAndDelete(req.params.community_id);

//       res.json(communityInfo);
//     } catch (error) {
//       console.log(error);
//       res.status(500).send('Server error');
//     }
//   };
