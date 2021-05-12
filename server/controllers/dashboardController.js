import Community from "../models/Community.js";
import { getPosts } from "./communityHomeController.js";

import { dashboardReqProducer } from "../kafka/producers/dashboardReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { dashboardResConsumer } from "../kafka/consumers/dashboardResConsumer.js";

// userConsumer.start();
dashboardReqProducer.connect();

export let dashboardController = {};

// @route GET api/dashboard/
// @desc get all posts along with comments
// @access Private
dashboardController.getAllPosts = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  dashboardReqProducer.send({
    topic: "dashboard_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "getAllPosts",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
  // try {
  //   const myCommunities = await Community.find(
  //     { creatorID: req.user.id },
  //     { id: 1, communityName: 1 }
  //   );
  //   const rootPromises = myCommunities.map(async (ele) => {
  //     return getPosts(ele.id, ele.communityName, req.user.id);
  //   });
  //   const nestedComments = await Promise.all(rootPromises);
  //   res.json(nestedComments);
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).send("Server error");
  // }
};
