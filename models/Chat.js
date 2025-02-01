const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // User IDs
    lastMessage: { type: String }, // Preview of the latest message
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
