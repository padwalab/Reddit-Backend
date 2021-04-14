import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
dotenv.config({ path: '.env' });

// @route POST api/users
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

// @route GET api/login
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

// @route POST api/login
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
