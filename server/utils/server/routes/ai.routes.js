const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const User = require('../models/User');
const { generateMultipleQuestions } = require('../utils/aiGenerator');

// Admin middleware
const adminOnly = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access only' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No token' });
  }
};

// @route   POST /api/ai/generate
// @desc    Generate questions using AI
// @access  Admin
router.post('/generate', adminOnly, async (req, res) => {
  try {
    const { topic, count = 1 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a topic' 
      });
    }

    if (count < 1 || count > 10) {
      return res.status(400).json({
        success: false,
        message: 'Count must be between 1 and 10'
      });
    }

    console.log(`Starting AI generation: ${count} questions on ${topic}`);

    const { questions, errors } = await generateMultipleQuestions(topic, count);
    
    const savedQuestions = [];
    
    for (const q of questions) {
      const newQuestion = new Question({
        ...q,
        topic,
        isAIGenerated: true
      });
      await newQuestion.save();
      savedQuestions.push(newQuestion);
    }

    res.json({
      success: true,
      generated: savedQuestions.length,
      failed: errors.length,
      questions: savedQuestions,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('AI Route Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
