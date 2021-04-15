import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { S3 } from '../config/s3.js';
import uuid from 'uuid';

import User from '../models/User.js';
dotenv.config({ path: '.env' });

// @route POST api/user/register
// @desc Register user
// @access Public

export let userController = {};

userController.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    // See if user exists
    let newUser = await User.findOne({ email });

    if (newUser) {
      return res.status(400).json({
        errors: [{ msg: `${email} already belongs to another account.` }],
      });
    }
    newUser = new User({ firstName, lastName, email });
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    newUser.save();

    const payload = {
      user: {
        id: newUser.id,
      },
    };

    // Return jsonwebtoken
    jwt.sign(
      payload,
      process.env.SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token: `Bearer ${token}` });
      }
    );
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// @route GET api/user/login
// @desc login page
// @access Private
userController.loadUser = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @route POST api/user/login
// @desc Authenticate user and get token
// @access Public
userController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }, { password: 1 });
    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg:
              'Whoops! We couldn’t find an account for that email address and password',
          },
        ],
      });
    }

    // Compare password
    const matchPwd = await bcrypt.compare(password, user.password);

    if (!matchPwd) {
      return res.status(400).json({
        errors: [
          {
            msg:
              'Whoops! We couldn’t find an account for that email address and password',
          },
        ],
      });
    }

    const payload = {
      user: {
        email: email,
        id: user.id,
      },
    };

    // Return jsonwebtoken
    jwt.sign(
      payload,
      process.env.SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token: `Bearer ${token}` });
      }
    );
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// @route PUT api/user/me
// @desc Update profile
// @access Private
userController.updateProfile = async (req, res) => {
  let filepath;
  const {
    firstName,
    lastName,
    currentPassword,
    newPassword,
    gender,
    aboutMe,
    location,
    topicList,
  } = req.body;

  try {
    if (req.file) {
      const myFile = req.file.originalname.split('.');
      const fileType = myFile[myFile.length - 1];

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer,
      };

      S3.upload(params, (error) => {
        if (error) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Error uploading file' }] });
        }
      });
      filepath = params.Key;
    }

    const userFound = await User.findById(req.user.id);
    const userFields = {};
    if (firstName && userFound.firstName !== firstName) {
      userFields.firstName = firstName;
    }
    if (lastName && userFound.lastName !== lastName) {
      userFields.lastName = lastName;
    }
    if (gender && userFound.gender !== gender) {
      userFields.gender = gender;
    }

    if (aboutMe && userFound.aboutMe !== aboutMe) {
      userFields.aboutMe = aboutMe;
    }
    if (location && userFound.location !== location) {
      userFields.location = location;
    }
    if (req.file && userFound.profilePicture !== filepath) {
      userFields.profilePicture = filepath;
    }
    if (topicList) {
      userFields.topicList = topicList.split(',').map((skill) => skill.trim());
    }
    if (currentPassword && newPassword) {
      // Compare password
      const matchPwd = await bcrypt.compare(
        currentPassword,
        userFound.password
      );

      if (!matchPwd) {
        return res.status(401).json({
          errors: [
            {
              msg: 'Incorrect Password',
            },
          ],
        });
      }
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      userFields.password = await bcrypt.hash(newPassword, salt);
    }

    if (userFound) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: userFields,
        },
        {
          select: { password: 0, date: 0, communities: 0, messages: 0 },
          new: true,
        }
      );

      res.json(updatedUser);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
};

// @route GET api/user/:user_id
// @desc get profile by id
// @access Public
userController.getProfileByUserId = async (req, res) => {
  try {
    const profile = await User.findById(req.params.user_id, {
      password: 0,
      date: 0,
      messages: 0,
    });
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
