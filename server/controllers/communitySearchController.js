import { sqlDB } from "../config/queries.js";
import Community from "../models/Community.js";
import { communitySearchReqProducer } from "../kafka/producers/communitySearchReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { communitySearchResConsumer } from "../kafka/consumers/communitySearchResConsumer.js";

communitySearchReqProducer.connect();

export let communitySearchController = {};

// @route GET api/community-search/
// @desc search community
// @access Public
communitySearchController.searchCommunity = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communitySearchReqProducer.send({
    topic: "commsearch_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "searchCommunity",
          params: req.params,
          user: req.user,
        }),
      },
    ],
  });
  // const { filter } = req.params;
  // let communities = [];
  // if (!filter) {
  //   communities = await Community.find();
  // } else {
  //   communities = await Community.find({
  //     communityName: { $regex: filter, $options: "i" },
  //   });
  // }
  // if (communities) {
  //   const upvotesPost = await Promise.all(
  //     communities.map(async (community) => {
  //       const count = await sqlDB.sumOfAllUpvotesForPosts(community.id);
  //       return {
  //         id: community.id,
  //         title: community.communityName,
  //         description: community.description,
  //         image: community.images,
  //         postsCount: community.posts.length,
  //         date: community.createdDate,
  //         users: community.subscribers.length,
  //         votes: Math.abs(
  //           community.upvotes.length - community.downvotes.length
  //         ),
  //         postUpvotes: count[0].upvotes,
  //       };
  //     })
  //   );
  //   res.send(upvotesPost);
  // }
};
