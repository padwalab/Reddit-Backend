import Community from "../models/Community.js";
// import { getPosts } from "./communityHomeController.js";

import { dashboardReqProducer } from "../kafka/producers/dashboardReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { dashboardResConsumer } from "../kafka/consumers/dashboardResConsumer.js";

// userConsumer.start();
dashboardReqProducer.connect();

export let dashboardController = {};

const getPosts = async (communityID, communityName, userId) => {
  const allPosts = await sqlDB.getAllPosts(communityID);

  const z = {};
  const nestedObject = allPosts.map(async (post) => {
    let obj = new Object();
    obj["post"] = post;
    obj.post["postVotes"] = await sqlDB.getPostVoteCount(post.id, userId);
    const rcs = await sqlDB.getRootCommentIds(communityID, post.id);

    if (rcs.length) {
      const promiseComments = rcs.map(async (e) => {
        obj.post[`cv_${e.id}`] = await sqlDB.getCommentVoteCount(e.id, userId);

        return await sqlDB.getAllComments(e.id);
      });
      const allComments = await Promise.all(promiseComments);
      obj.post["numberOfComments"] = allComments.flat(1).length;

      const promiseSeq = rcs.map(async (e) => await sqlDB.getSequences(e.id));
      const allSeq = await Promise.all(promiseSeq);

      const childParent = allSeq.flat(1).map((e) => {
        const p = e.seq.split(",");
        return {
          pid: e.postId,
          id: e.id,
          parent: parseInt(p[p.length - 2]) || null,
        };
      });
      const groupedChildParentByPostId = _.mapValues(
        _.groupBy(childParent, "pid"),
        (cplist) => cplist.map((cp) => _.omit(cp, "pid"))
      );
      const groupedCommentsByPostId = _.mapValues(
        _.groupBy(allComments.flat(1), "postId"),
        (clist) => clist.map((comment) => _.omit(comment, "postId"))
      );

      obj.post["comments"] = findFor(
        null,
        groupedChildParentByPostId[post.id],
        groupedCommentsByPostId[post.id]
      );
    }
    return obj;
  });

  z[communityName] = await Promise.all(nestedObject);
  return z;
};

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
