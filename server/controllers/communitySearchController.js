import { sqlDB } from "../config/queries.js";
import Community from "../models/Community.js";

export let communitySearchController = {};

// @route GET api/community-search/
// @desc search community
// @access Public
communitySearchController.searchCommunity = async (req, res) => {
  const { filter } = req.query;
  let communities = [];
  if (!filter) {
    communities = await Community.find();
  } else {
    communities = await Community.find({
      communityName: { $regex: filter, $options: "i" },
    });
  }
  if (communities) {
       const upvotesPost = await Promise.all(
          communities.map(async (community) => { 
           const count = await sqlDB.sumOfAllUpvotesForPosts(community.id)
          return {
          id: community.id,
          title: community.communityName,
          description: community.description,
          image: community.images,
          postsCount: community.posts.length,
          date: community.createdDate,
          users: community.subscribers.length,
          votes: Math.abs(
            community.upvotes.length - community.downvotes.length
          ),
          postUpvotes: count[0].upvotes,
          }
        })
        );
        res.send(upvotesPost);
      }
    }
