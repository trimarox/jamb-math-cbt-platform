const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const User = require('../models/User');

// Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No token' });
  }
};

// @route   GET /api/exam/questions
// @desc    Get 50 random questions for exam
// @access  Private
router.get('/questions', protect, async (req, res) => {
  try {
    // Get 50 random questions
    const questions = await Question.aggregate([
      { $sample: { size: 50 } },
      { $project: { correctAnswer: 0, explanation: 0 } } // Hide answers
    ]);

    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/exam/submit
// @desc    Submit exam and get results
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers, timeSpent, examType = 'exam' } = req.body;
    
    // answers format: [{ questionId, selectedOption }, ...]

    let correctCount = 0;
    const detailedResults = [];

    // Check each answer
    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);
      
      if (!question) continue;

      const isCorrect = question.correctAnswer === answer.selectedOption;
      if (isCorrect) correctCount++;

      detailedResults.push({
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedOption: answer.selectedOption,
        isCorrect,
        explanation: question.explanation,
        topic: question.topic
      });

      // Update usage count
      await Question.findByIdAndUpdate(answer.questionId, {
        $inc: { usageCount: 1 }
      });
    }

    // Calculate scores
    const totalQuestions = answers.length;
    const percentage = (correctCount / totalQuestions) * 100;
    const jambScore = Math.round((correctCount / totalQuestions) * 400); // JAMB is out of 400

    // Save to user history
    const examRecord = {
      examType,
      score: correctCount,
      totalQuestions,
      jambScore,
      timeSpent,
      answers: detailedResults.map(r => ({
        questionId: r.questionId,
        selectedOption: r.selectedOption,
        isCorrect: r.isCorrect
      }))
    };

    await User.findByIdAndUpdate(req.user._id, {
      $push: { examHistory: examRecord }
    });

    res.json({
      success: true,
      results: {
        score: correctCount,
        totalQuestions,
        percentage: Math.round(percentage),
        jambScore,
        timeSpent,
        detailedResults
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/exam/history
// @desc    Get user's exam history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      history: req.user.examHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
