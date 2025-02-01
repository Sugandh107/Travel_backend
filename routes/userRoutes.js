const express = require('express');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Get all users
router.post("/signup", async (req, res) => {
    const { name, password,photoURL, email } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Create a new user in the database
      const newUser = new User({
        name,
        email,
        password,
        photoURL,
      });
  
      await newUser.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to create user", error: err.message });
      console.log(err);
      
    }
  });

  
  router.get('/user-profile', async (req, res) => {
    const { email } = req.query;  // Get email from query parameter
  
    try {
      // Fetch user data from MongoDB based on email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);  // Return user data
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });
  

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a post for the user
router.post('/add-post', async (req, res) => {
  const { email, imageUrl, caption } = req.body;

  try {
    // Check if all required fields are provided
    if (!email || !imageUrl || !caption) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the new post to the user's posts array
    const post = { imageUrl, caption };
    user.posts.push(post);

    // Save the updated user document
    await user.save();

    res.status(201).json({ message: 'Post added successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all posts for a specific user
router.get('/get-posts', async (req, res) => {
  const { email } = req.query; // Extract the email from query parameters

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user's posts
    res.status(200).json({ posts: user.posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
