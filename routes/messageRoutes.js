  // server/routes/message.js
  const express = require('express');
  const router = express.Router();
  const Message = require('../models/Message');

  // Get all messages between two users
  router.get('/:user1Id/:user2Id', async (req, res) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: req.params.user1Id, receiver: req.params.user2Id },
          { sender: req.params.user2Id, receiver: req.params.user1Id },
        ],
      }).sort({ timestamp: 1 });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });

  // Send a message from one user to another
  router.post('/', async (req, res) => {
    try {
      const { sender, receiver, content } = req.body;

      // Make sure all required fields are provided
      if (!sender || !receiver || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Create new message document
      const newMessage = new Message({
        sender,
        receiver,
        content,
        timestamp: new Date(),
      });

      // Save to the database
      await newMessage.save();

      res.status(201).json(newMessage); // Return the sent message
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // server/routes/message.js
  router.get('/conversations/:userId', async (req, res) => {
    try {
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: req.params.userId },
              { receiver: req.params.userId },
            ],
          },
        },
        {
          $sort: { timestamp: -1 } // Sort messages by timestamp (descending) to get the most recent
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', req.params.userId] },
                '$receiver',
                '$sender',
              ],
            },
            lastMessage: { $first: '$content' }, // Use $first to capture the most recent message
            lastMessageTime: { $first: '$timestamp' }, // Capture the timestamp of the last message
          },
        },
        {
          $lookup: {
            from: 'users', // Assuming your user collection is named 'users'
            localField: '_id', // The user id you're comparing to
            foreignField: '_id', // Matching with the user's _id field
            as: 'user',
          },
        },
        {
          $unwind: '$user', // Flatten the user data so you can access user details
        },
        {
          $project: {
            'user.password': 0, // Exclude password from response (if it's present in the user schema)
            _id: 0, // Optionally exclude _id from the final response
          },
        },
        {
          $sort: { lastMessageTime: -1 }, // Sort conversations by the most recent message
        },
      ]);

      res.json(conversations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching conversations' });
    }
  });



  module.exports = router;
