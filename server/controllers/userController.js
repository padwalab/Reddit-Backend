import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { S3 } from "../config/s3.js";
import uuid from "uuid";

import User from "../models/User.js";
dotenv.config({ path: ".env" });

import { userReqProducer } from "../kafka/producers/userReqProducer.js";
import { responses } from "../kafka/kafka.js";
import { userResConsumer } from "../kafka/consumers/userResConsumer.js";

// userConsumer.start();
userReqProducer.connect();

// @route POST api/user/register
// @desc Register user
// @access Public

export let userController = {};

userController.test = (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  console.log(
    JSON.stringify({
      id: requestId,
      action: "test",
      params: req.params,
      // body: req.body,
    })
  );
  userReqProducer.send({
    topic: "users_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "test",
          params: req.params,
          // body: req.body,
        }),
      },
    ],
  });
};
userController.register = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  userReqProducer.send({
    topic: "users_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "register",
          params: req.params,
          body: req.body,
        }),
      },
    ],
  });
};

// @route GET api/user/login
// @desc login page
// @access Private
userController.loadUser = (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  userReqProducer.send({
    topic: "users_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "loadUser",
          params: req.params,
          body: req.body,
          user: req.user,
        }),
      },
    ],
  });
};

// @route POST api/user/login
// @desc Authenticate user and get token
// @access Public
userController.login = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  userReqProducer.send({
    topic: "users_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "login",
          params: req.params,
          body: req.body,
        }),
      },
    ],
  });
};

// @route PUT api/user/me
// @desc Update profile
// @access Private
userController.updateProfile = async (req, res) => {
  let data;
  if (req.file) {
    const myFile = file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}.${fileType}`,
      Body: file.buffer,
    };
    data = await S3.upload(params).promise();
  }
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  userReqProducer.send({
    topic: "users_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "updateProfile",
          params: req.params,
          body: req.body,
          user: req.user,
          file: data.Key,
        }),
      },
    ],
  });
};

// @route GET api/user/:user_id
// @desc get profile by id
// @access Public
userController.getProfileByUserId = async (req, res) => {
  const requestId = Math.random().toString(36).substr(2);
  responses[requestId] = res;
  console.log(requestId);
  userReqProducer.send({
    topic: "users_request",
    messages: [
      {
        value: JSON.stringify({
          id: requestId,
          action: "getProfileByUserId",
          params: req.params,
          body: req.body,
        }),
      },
    ],
  });
};
