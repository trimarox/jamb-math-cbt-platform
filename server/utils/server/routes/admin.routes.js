const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const User = require('../models/User');

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

// @route   GET /api/admin/questions
// @desc    Get all questions with pagination
// @access  Admin
router.get('/questions', adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments();

    res.json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/questions
// @desc    Create new question
// @access  Admin
router.post('/questions', adminOnly, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/questions/:id
// @desc    Update question
// @access  Admin
router.put('/questions/:id', adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete question
// @access  Admin
router.delete('/questions/:id', adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Admin
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const aiGeneratedQuestions = await Question.countDocuments({ isAIGenerated: true });
    const totalUsers = await User.countDocuments();
    const totalExams = await User.aggregate([
      { $project: { examCount: { $size: '$examHistory' } } },
      { $group: { _id: null, total: { $sum: '$examCount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalQuestions,
        aiGeneratedQuestions,
        manualQuestions: totalQuestions - aiGeneratedQuestions,
        totalUsers,
        totalExamsTaken: totalExams[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
