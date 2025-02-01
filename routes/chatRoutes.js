const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const router = express.Router();

router.get('/api/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find chats where the user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name photoURL')
      .sort({ updatedAt: -1 }); // Latest chat first

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});
router.get('/api/chats/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'name photoURL')
        .sort({ updatedAt: -1 }); // Sort by most recent chat
  
      res.status(200).json(chats);
    } catch (err) {
      console.error('Error fetching chats:', err);
      res.status(500).json({ message: 'Failed to fetch chats' });
    }
  });
  

module.exports = router;
