import dotenv from 'dotenv';
import Community from '../models/Community.js';
import { S3 } from '../config/s3.js';
import uuid from 'uuid';
dotenv.config({ path: '.env' });

export let communityController = {};

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
      description,
      creatorID: req.user.id,
    });
    if (filepath) {
      newCommunity.comProfilePicture = filepath;
    }
    await newCommunity.save();
    const communityID = newCommunity._id;
    let out;
    if (rules) {
      const parsedRules = JSON.parse(rules);
      out = await Community.findByIdAndUpdate(
        communityID,
        { $set: { rules: parsedRules } },
        { new: true }
      );
    }
    res.json('Community created');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
