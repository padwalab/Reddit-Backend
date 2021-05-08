import { sqlDB } from '../config/queries.js';
import Community from '../models/Community.js';

export let communitySearchController = {};

// @route GET api/community-search/:filter
// @desc search community
// @access Private
communitySearchController.searchCommunity = async (req, res) => {
    const {filter} = req.params;
    let response = []
    const communities = await Community.find({ communityName: {$regex :filter, $options: 'i'} });
    let allPosts = [];
    let upvotesPost = [];
    if(communities){
    for(let i=0;i<communities.length;i++){
    if(communities[i].posts.length>0){
    allPosts = await sqlDB.getAllPosts(communities[i].id);
    upvotesPost = await Promise.all(allPosts.map(async (post) => await sqlDB.getUpVotesforVotesPosts(post.id)));
   response.push(
       {
        title: communities[i].communityName,
        description: communities[i].description,
        image:communities[i].images,
        postsCount: communities[i].posts.length,
        date: communities[i].createdDate,
        users: communities[i].subscribers.length,
        votes: Math.abs(communities[i].upvotes.length-communities[i].downvotes.length),
        posts: upvotesPost
      }
    )
    }
  }
   res.send(response);
  }
  }