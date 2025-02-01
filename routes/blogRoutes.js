const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');

// Get blogs for a specific destination
router.get('/:destinationId', async (req, res) => {
  try {
    const blogs = await Blog.find({ destinationId: req.params.destinationId }).populate('userId', 'name photoURL');
    
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a blog for a destination
router.post('/', async (req, res) => {
  const { destinationId, userId, content } = req.body;
  try {
    const blog = new Blog({ destinationId, userId, content });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
