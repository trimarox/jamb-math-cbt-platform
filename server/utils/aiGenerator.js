const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOPIC_PROMPTS = {
  'Algebra': 'algebraic expressions, equations, inequalities, polynomials, quadratic equations',
  'Calculus': 'limits, differentiation, integration, rates of change, maxima and minima',
  'Geometry': 'Euclidean geometry, circles, triangles, polygons, congruence, similarity',
  'Trigonometry': 'trigonometric ratios, identities, equations, graphs, bearings',
  'Statistics': 'mean, median, mode, standard deviation, data interpretation',
  'Probability': 'probability rules, combinations, permutations, events',
  'Mensuration': 'areas, volumes, surface areas of 2D and 3D shapes',
  'Coordinate Geometry': 'straight lines, gradients, distances, midpoints',
  'Vectors': 'vector operations, position vectors, scalar product',
  'Matrices': 'matrix operations, determinants, inverse matrices',
  'Complex Numbers': 'complex number operations, Argand diagram',
  'Sequences and Series': 'arithmetic, geometric progressions, sum to infinity',
  'Differentiation': 'rules of differentiation, applications',
  'Integration': 'indefinite and definite integrals, applications'
};

const generateMathQuestion = async (topic) => {
  const topicDescription = TOPIC_PROMPTS[topic] || topic;
  
  const prompt = `
You are an expert JAMB Mathematics examiner in Nigeria. Create a standard JAMB-style question on ${topic}.
Topic context: ${topicDescription}

Requirements:
1. Question must test understanding, not just memorization
2. Include realistic numerical values
3. All 4 options must be plausible (common mistakes should lead to wrong answers)
4. Explanation must show step-by-step working
5. Difficulty should be Medium (standard JAMB level)

Return ONLY a valid JSON object in this exact format:
{
  "questionText": "string",
  "options": {
    "A": "string",
    "B": "string", 
    "C": "string",
    "D": "string"
  },
  "correctAnswer": "A|B|C|D",
  "explanation": "string with step-by-step solution",
  "difficulty": "Easy|Medium|Hard"
}

Do not include markdown formatting, just raw JSON.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cheaper option, or use "gpt-4" for better quality
      messages: [
        { role: "system", content: "You are a JAMB Mathematics question generator. Always return valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content.trim();
    
    // Clean up potential markdown formatting
    const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(jsonString);
    
    // Validate structure
    if (!parsed.questionText || !parsed.options || !parsed.correctAnswer || !parsed.explanation) {
      throw new Error('Invalid response structure from AI');
    }
    
    if (!['A', 'B', 'C', 'D'].includes(parsed.correctAnswer)) {
      throw new Error('Invalid correct answer format');
    }
    
    return parsed;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`Failed to generate question: ${error.message}`);
  }
};

const generateMultipleQuestions = async (topic, count) => {
  const questions = [];
  const errors = [];
  
  for (let i = 0; i < count; i++) {
    try {
      // Add delay to avoid rate limits
      if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
      
      const question = await generateMathQuestion(topic);
      questions.push(question);
      console.log(`Generated question ${i + 1}/${count} for ${topic}`);
    } catch (error) {
      console.error(`Failed to generate question ${i + 1}:`, error.message);
      errors.push({ index: i, error: error.message });
    }
  }
  
  return { questions, errors };
};

module.exports = {
  generateMathQuestion,
  generateMultipleQuestions
};
