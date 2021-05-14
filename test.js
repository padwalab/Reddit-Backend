import app from "./app.js";
import chai from "chai";
import http from "chai-http";
chai.use(http);
const agent = chai.request.agent(app);

describe("Reddit", function () {
  describe("Login", function () {
    it("Successful Login", () => {
      agent
        .post("/api/user/login")
        .send({ email: "kelly@gmail.com", password: "fullstack" })
        .then(function (res) {
          chai.expect(res.statusCode).to.equal(200);
        })
        .catch((error) => {
          console.log(error);
        });
    });

    it("Invalid Credentials", () => {
      agent
        .post("/api/user/login")
        .send({ email: "kelly@gmail.com", password: "invalid" })
        .then(function (res) {
          chai
            .expect(res.text)
            .to.equal(
              '{"errors":[{"msg":"Whoops! We couldn’t find an account for that email address and password"}]}'
            );
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Signup", function () {
    it("Successful Signup", () => {
      agent
        .post("/api/user/register")
        .send({
          firstName: "Mocha",
          lastName: "Test",
          email: "test@test.com", // change before executing 
          password: "test1234",
        })
        .then(function (res) {
          chai.expect(res.statusCode).to.equal(200);
        })
        .catch((error) => {
          console.log(error);
        });
    });

    it("Account Already Exists", () => {
      agent
        .post("/api/user/register")
        .send({
          firstName: "Kelly",
          lastName: "Klein",
          email: "kelly@gmail.com",
          password: "fullstack",
        })
        .then(function (res) {
          chai
            .expect(res.text)
            .to.equal(
              '{"errors":[{"msg":"kelly@gmail.com already belongs to another account."}]}'
            );
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Community Search", function () {
    it("Search Communities", () => {
      agent
        .get("/api/community-search/data")
        .then(function (res) {
          res.body.forEach((community) => {
            chai.expect(community.title).to.match(/data/i);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Posts", function () {
    it("Get Posts by ID", () => {
      agent
        .post("/api/post/31")
        .send({
          userID: "6092d4830a67a301ed53ced8",
          communityID: "6092d4a70a67a301ed53ced9",
        })
        .then(function (res) {
          chai
            .expect(res.text)
            .to.match(
              /"id":31,"creatorId":"6092d4830a67a301ed53ced8","date":"2021-05-07T19:25:13.000Z","communityId":"6092d4a70a67a301ed53ced9","type":"Link","title":"Data","creatorName":"kelly"/i
            );
        })
        .catch((error) => {
          console.log(error);
        });
    });

    it("Get Post votes", () => {
      agent
        .get("/api/post/vote")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4"
        )
        .send({
          postId: 31,
        })
        .then(function (res) {
          chai.expect(res.body).to.have.property("upvotes");
          chai.expect(res.body).to.have.property("downvotes");
          chai.expect(res.body).to.have.property("userVoted");
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Find Users", function () {
    it("Find Users", () => {
      agent
        .post("/api/message/find")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4"
        )
        .send({
          userName: "kelly",
        })
        .then(function (res) {
          res.body.forEach((user) => {
            chai.expect(user.firstName || user.lastName).to.match(/kelly/i);
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Community Analytics", function () {
    it("Community Analytics", () => {
      agent
        .get("/api/community-analytics")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4"
        )
        .then(function (res) {
          chai.expect(res.body).to.have.property("MaxUserCount");
          chai.expect(res.body).to.have.property("MaxPostCount");
          chai.expect(res.body).to.have.property("UpvotedPost");
          chai.expect(res.body).to.have.property("UserMaxPost");
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Community Home", function () {
    it("Get Community Info", () => {
      agent
        .get("/api/community-home/6092d4a70a67a301ed53ced9/6092d4830a67a301ed53ced8")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4"
        )
        .then(function (res) {
          chai.expect(res.body.id).to.equal('6092d4a70a67a301ed53ced9');
          chai.expect(res.body.communityName).to.equal('Biology');
          chai.expect(res.body.creatorName).to.equal('kelly');
          chai.expect(res.body.createdDate).to.equal('2021-05-05T17:23:51.256Z');
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });
  describe("Comments", function () {
    it("Add a comment", () => {
      agent
        .post("/api/comment/")
        .send({
          postId: 31,
          text: "Mocha Testing...",
        }).set( "Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4")
        .then(function (res) {
          // console.log("response ",res.text);
          chai
            .expect(res.text)
            .to.match(
              /"postId":31,"text":"Mocha Testing..."/);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  })

  describe("Message", function () {
    it("Send a message", () => {
      agent
        .post("/api/message/")
        .send({
          toUserId: "6092d41e0a67a301ed53ced6",
          text: "Mocha Send Message Testing...",
        }).set( "Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4")
        .then(function (res) {
          chai
            .expect(res.text)
            .to.match(
              /"toUserId":{"firstName":"jill","id":"6092d41e0a67a301ed53ced6"},"fromUserId":{"firstName":"kelly","id":"6092d4830a67a301ed53ced8"},"text":"Mocha Send Message Testing..."/);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  describe("Community Moderator", function () {
    it("Get List of Communities", () => {
      agent
        .get("/api/moderator/")
        .set( "Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoia2VsbHlAZ21haWwuY29tIiwiaWQiOiI2MDkyZDQ4MzBhNjdhMzAxZWQ1M2NlZDgifSwiaWF0IjoxNjIwNjc5NjA4LCJleHAiOjE2MjEwMzk2MDh9.Oy4dlaLoyboP6IYhRa0rgJT09BQInXleO52oo6i8lR4")
        .then(function (res) {
          chai
            .expect(res.body)
            .to.be.an('array');
        })
        .catch((error) => {
          console.log(error);
        });
    });
  })
});
