import { sqlDB } from "../config/queries.js";
import Community from "../models/Community.js";

import { communityAnalyticsReqProducer } from "../kafka/producers/communityAnalyticsReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { communityAnalyticsResConsumer } from "../kafka/consumers/communityAnalyticsResConsumer.js";

communityAnalyticsReqProducer.connect();

export let communityAnalyticsController = {};

// @route GET api/community-analytics/
// @desc analytics
// @access Private
communityAnalyticsController.analytics = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  communityAnalyticsReqProducer.send({
    topic: "analytics_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "analytics",
          params: req.params,
          user: req.user,
        }),
      },
    ],
  });
  // const communities = await Community.find({ creatorID: req.user.id }).limit(
  //   10
  // );
  // if (communities.length > 0) {
  //   let communityIds = [];
  //   const communityInfo = communities.map((community) => {
  //     return {
  //       communityName: community.communityName,
  //       userCount: community.subscribers.length,
  //     };
  //   });
  //   const postInfo = communities.map((community) => {
  //     return {
  //       communityName: community.communityName,
  //       postCount: community.posts.length,
  //     };
  //   });

  //   let postsInfo = [];
  //   for (let i = 0; i < communities.length; i++) {
  //     if (communities[i]) {
  //       for (let j = 0; j < communities[i].posts.length; j++) {
  //         const post = await sqlDB.getUpVotesforPost(communities[i].posts[j]);
  //         postsInfo = postsInfo.concat({
  //           communityName: communities[i].communityName,
  //           postInfo: post,
  //         });
  //       }
  //       communityIds = communityIds.concat(communities[i]._id);
  //     }
  //   }

  //   const userCount = await sqlDB.getUserWithPostCount(communityIds);
  //   const maxPost = await userCount.map(async (usr) => {
  //     return {
  //       user: usr.creatorName,
  //       postCount: usr.postCount,
  //     };
  //   });
  //   const userMaxPost = await Promise.all(maxPost);

  //   postsInfo.sort((a, b) => b.postInfo.upvotes - a.postInfo.upvotes);
  //   userMaxPost.sort((c, d) => d.postCount - c.postCount);
  //   communityInfo.sort((e, f) => f.userCount - e.userCount);
  //   if (postsInfo.length > 10) {
  //     postsInfo.length = 10;
  //   }
  //   if (userMaxPost.length > 10) {
  //     userMaxPost.length = 10;
  //   }
  //   res.json({
  //     MaxUserCount: communityInfo,
  //     MaxPostCount: postInfo,
  //     UpvotedPost: postsInfo,
  //     UserMaxPost: userMaxPost,
  //   });
  // } else {
  //   res.send("You do not own a community");
  // }
};
