// server/routes/expense.js
const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

// Add a new expense
router.post('/add', async (req, res) => {
  const { userId, name, amount, category, date } = req.body;

  try {
    const newExpense = new Expense({
      userId,
      name,
      amount,
      category,
      date,
    });

    await newExpense.save();
    res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
  } catch (err) {
    res.status(500).json({ message: 'Error adding expense', error: err.message });
    console.log(err);
    
  }
});

// Get all expenses for a specific user
// server/routes/expense.js
router.get('/:userId', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.params.userId }).sort({ date: -1 });
    console.log('Fetched expenses:', expenses); // Log the fetched expenses
    res.status(200).json(expenses); // Return the expenses array
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
});

module.exports = router;
