import Community from '../models/Community.js';
import { getPosts } from './communityHomeController.js';

export let dashboardController = {};

// @route GET api/dashboard/
// @desc get all posts along with comments
// @access Private
dashboardController.getAllPosts = async (req, res) => {
  try {
    const myCommunities = await Community.find(
      { creatorID: req.user.id },
      { id: 1 }
    );
    const rootPromises = myCommunities.map(async (ele) => {
      return getPosts(ele.id, req.user.id);
    });
    const nestedComments = await Promise.all(rootPromises);
    res.json(nestedComments);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};
