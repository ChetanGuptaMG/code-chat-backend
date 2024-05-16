const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const getuser = require("../middleware/getUser");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });
const mysign = process.env.MYSIGN;
router.use(express.json());

//Sign up route
router.post(
  "/createuser",
  [
    body("email", "Invalid Email address").isEmail(),
    body("username", "Invalid username").isLength({ min: 3 }),
    body("password", "Password must be of atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    console.log(req.body);
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ success, Status: "Please try again!" });
    }
    try {
      let user = await Users.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, Status: "Email already exists" });
      }
      let username = await Users.findOne({ username: req.body.username });
      if (username) {
        return res
          .status(400)
          .json({ success, Status: "Username already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, salt);
      user = await Users.create({
        email: req.body.email,
        username: req.body.username,
        password: password,
      });
      console.log(user, "line 46");
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, mysign);
      success = true;
      if(success){
        const usercreated = {
          _id: user._id,
          email: user.email,
          username: user.username,
          token,
        }
        return res.json(usercreated);
      }

        if (user) {
        
        res.status(400).json({
          _id: user._id,
          email: user.email,
          username: user.username,
          token,
        });
      } else {
        res.status(400);
        throw new Error("User not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, Status: "Server Error!" });
    }
  }
);

//Login route

// Login route
router.post(
  "/login",
  [
    body("email", "Invalid Email address").isEmail(),
    body("password", "Password must be of at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    let success = false;
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success,
          message: "Please enter correct email id",
        });
      }
      console.log(password, user.password);
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({
          success,
          message: "Please enter correct password",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, mysign);
      success = true;
      res.json({
        success,
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, Status: "Server Error!" });
    }
  }
);

// User Details route

router.get("/getuser", getuser, async (req, res) => {
  try {
    let success = false;
    const userId = req.user.id;
    const user = await Users.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ success, Status: "User Not Found" });
      return;
    }
    success = true;
    res.json({ success, user });
  } catch (error) {
    res.status(500).json({ success: false, Status: "Server error!" });
  }
});

module.exports = router;
