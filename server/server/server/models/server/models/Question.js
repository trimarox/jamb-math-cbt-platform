const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    enum: [
      'Algebra',
      'Calculus',
      'Geometry',
      'Trigonometry',
      'Statistics',
      'Probability',
      'Mensuration',
      'Coordinate Geometry',
      'Vectors',
      'Matrices',
      'Complex Numbers',
      'Sequences and Series',
      'Differentiation',
      'Integration'
    ]
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  year: {
    type: Number,
    default: 2024
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
questionSchema.index({ topic: 1, difficulty: 1 });
questionSchema.index({ isAIGenerated: 1 });

module.exports = mongoose.model('Question', questionSchema);
