const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');



// JWT Verification

const jwt = require('jsonwebtoken');
const { secret } = require("../config/jwtSecret");

const signupUser = async (req, res) => {
    const { name, username, email, password, phone } = req.body;

    if (!username || !password || !name || !email || !phone) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, name, email, password: hashedPassword, phone });
        await user.save();

        res.status(201).json({ message: 'User created successfully', user: user });
    } catch (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Validate user input
    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide all fields' });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("Invalid credentials");

        const token = jwt.sign({ username: user.username }, secret , {
            expiresIn: '1h',
        });

        res.status(200).json({ token, message: 'Logged in successfully' });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username}).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error getting user info:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};



// Twilio - OTP Verification

require("dotenv").config();
const twilio = require('twilio');
const OtpCache = require('../models/OtpCache');
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtp = async (req, res) => {
    const { phone } = req.body;

    try {
        // Check if the user exists and is already verified
        const user = await User.findOne({ phone });
        if (user && user.phoneVerified) {
            return res.status(400).send("User is already verified");
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Send OTP using Twilio
        await client.messages.create({
            body: `Your Petcare OTP is ${otp}`,
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER,
        });

        // Save the OTP in the cache
        await OtpCache.create({ phone, otp });

        res.status(200).send("OTP sent successfully");
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).send("Server error");
    }
};

const verifyOtp = async (req, res) => {
    const { phone, otp } = req.body;
  
    const record = await OtpCache.findOne({ phone });
    if (!record || record.otp !== otp) {
        console.log(record);
      return res.status(400).send("Invalid OTP");
    }
  
    // OTP is valid, authenticate user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.phoneVerified = true;
    await user.save();
    
    await OtpCache.deleteOne({ phone });
  
    res.status(200).send("OTP verified successfully");
};



// OAuth Verification //

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const createNewFacebookUser = async (profile) => {
    // Generate a random unique username
    const randomUsername = `user_${Math.random().toString(36).substring(2, 10)}`;
  
    // Create and save the new user
    const newUser = new User({
      username: randomUsername,
      facebookId: profile.id,
      name: profile.displayName || "Facebook User",
      email: profile.emails?.[0]?.value || null,
      password: "", // No password required for Facebook login
    });
  
    await newUser.save();
    return newUser;
};

const handleFacebookLogin = async (profile) => {
    // Step 1: Check if user exists by Facebook ID
    let user = await User.findOne({ facebookId: profile.id });
  
    // Step 2: If no user found by Facebook ID, check by username
    if (!user) {
      user = await User.findOne({ username: profile.usernames?.[0]?.value });
  
      // Step 3: If user exists without Facebook ID, update the Facebook ID
      if (user) {
        if (!user.facebookId) {
          user.facebookId = profile.id;
          await user.save();
        }
      } 
      else {
        // Step 4: If user doesn't exist, create a new user
        user = await createNewFacebookUser(profile);
      }
    }
  
    return user;
};

const loginUsingFacebook = async (req, res) => {
    const { accessToken } = req.body;
  
    try {
      // Verify token with Facebook's Graph API
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
      const profile = await response.json();
  
      if (profile.error) {
        return res.status(401).json({ message: 'Invalid Facebook access token', error: profile.error });
      }
  
      // Handle login/registration logic
      const user = await handleFacebookLogin(profile);
  
      res.json({ message: 'Login successful', user });
    } catch (error) {
      console.error('Error verifying Facebook token:', error);
      res.status(500).json({ message: 'Internal server error', error });
    }
};
  

passport.use(new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
    }, async (accessToken, refreshToken, profile, done) => {
    try{
          const user = await handleFacebookLogin(profile);
          return done(null, user);
    } 
    catch (error) {
          console.error("Error in Facebook Strategy:", error);
          return done(error, null);
    }
    }
));
  
module.exports = { signupUser, loginUser, getUserInfo, sendOtp, verifyOtp, loginUsingFacebook, passport };