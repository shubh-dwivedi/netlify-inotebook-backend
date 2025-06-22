const express = require("express");
const User = require("../models/User");
const fetchuser  = require("../middleware/fetchuser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const JWT_SECRET = "shubhamisagoodb$oy";

// ROUTE 1: Create a user using: POST "/api/auth/createuser" . login not required
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (event, res) => {
    //If there are errors, return bad request and errors
    const req = JSON.parse(event.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user_name = req.name
    const user_email = req.email
    const user_password = req.password
    let success = false;
    //check whether a user with same email exists in the server
    try {
      let user = await User.findOne({ email: user_email });
      if (user) {
        return res
          .status(400)
          .json({ 
            success: false,
            error: "Sorry! A user with this email already exists",
           });
      }

      //if user email is unique create a user entry in the database and send a response json message back to the user
      const salt = await bcrypt.genSalt(10);
      let secPass = await bcrypt.hash(user_password, salt);
      user = await User.create({
        name: user_name,
        email: user_email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      
      res.json({ success, authToken, name: user_name, email: user_email});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 2: Authenticate a user using: POST "/api/auth/login" . login not required
router.post(
  "/login",
  [
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password field cannot be blank!").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let success = false;
    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      if(!user) {
        return res.status(400).json({error: "Please try to login using correct credentials!"});
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare) {
        return res.status(400).json({error: "Please try to login using correct credentials!"});
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      let name = user.name;
      res.json({ success , authToken, name, email });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });

// ROUTE 3: Get logged in User details using: POST "/api/auth/getuser" . Login required
router.post(
  "/getuser", fetchuser,
  async (req, res) => {
    try {
      let userid = req.user.id;
      const user  = await User.findById(userid).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })

module.exports = router;
