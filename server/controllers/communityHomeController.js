import dotenv from 'dotenv';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { S3 } from '../config/s3.js';
import { sqlDB } from '../config/queries.js';
import uuid from 'uuid';
import mongoose from 'mongoose';
dotenv.config({ path: '.env' });

export let communityHomeController = {};

// @route POST api/community-home/join-community
// @desc get list of communities and requests to join
// @access Private
communityHomeController.requestToJOin = async (req, res) => {
  const { communityId } = req.body;
  try {
    await Community.findByIdAndUpdate(communityId, {
      $addToSet: { joinRequests: req.user.id },
    });

    res.json('join request sent');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
