const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Hemantisgood$boy';


// Route 1: create a user using: POST "/api/auth/createuser" . no login required

router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password must be 5 char').isLength({ min: 5 }),
], async (req, res) => {
 let success = false;
  // If there is error return bad request.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  // check wheather the user with the email exist already
  let user = await User.findOne({ email: req.body.email });
  try {
    if (user) {
      return res.status(400).json({ success, error: "sorry a user with this email is already exist" })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    // console.log(jwtData);
    // res.json(user)
    success.true;
    res.json({ success, authtoken })


    // .then(user => res.json(user))
    // .catch(err => {console.log(err)
    //   res.json({error: 'please enter a unique value for email', message: err.message})})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  };
})


// Route 2: Authenticate a user using: POST "/api/auth/login" . no login required

router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', "Password can't be blank").exists(),

], async (req, res) => {
  let success = false;
  // If there is error return bad request.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

// Route 3: Get login user detail using: POST "/api/auth/getuser" . - login required

router.post('/getuser', fetchuser, async (req, res) => {

  try {
   const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});



module.exports = router