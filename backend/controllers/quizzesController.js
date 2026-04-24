const Quiz = require("../models/Quiz");
const askHF = require("../services/aiService");
const { processFile } = require("../services/fileProcessor");
const fs = require('fs');

/**
 * 1) Find user's weak topics based on quiz scores
 */
exports.getWeakTopics = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).lean();
    const topicMap = {};
    quizzes.forEach((q) => {
      if (q.score == null) return;
      const topic = q.topic || "General";
      if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };
      topicMap[topic].total += q.score;
      topicMap[topic].count++;
    });
    const sorted = Object.entries(topicMap)
      .map(([topic, data]) => ({ topic, avg: data.total / data.count }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
      .map((x) => x.topic);
    res.json({ weakTopics: sorted, suggestions: sorted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 2) Generate a quiz using AI (with file upload support)
 */
exports.generateQuiz = async (req, res) => {
  const { topic, numQuestions = 5, difficulty = 'mixed' } = req.body;
  let fileContent = '';
  
  if (!topic && !req.file) {
    return res.status(400).json({ message: "Either topic or file is required" });
  }
  
  const n = Math.max(1, Math.min(30, Number(numQuestions) || 5));
  
  try {
    // Process uploaded file if present
    if (req.file) {
      fileContent = await processFile(req.file.path, req.file.mimetype);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
    
    // ULTRA STRONG PROMPT for accurate MCQs from file content
    const prompt = `You are an expert exam creator. Generate ${n} HIGH-QUALITY multiple-choice questions.

${fileContent ? `SOURCE MATERIAL (USE ONLY THIS):\n${fileContent}\n\n` : `TOPIC: ${topic}\n\n`}

DIFFICULTY LEVEL: ${difficulty === 'easy' ? 'Easy' : difficulty === 'hard' ? 'Hard' : 'Mixed (Easy, Medium, Hard)'}

CRITICAL RULES (MUST FOLLOW):
1. Questions MUST be based ONLY on the provided ${fileContent ? 'file content' : 'topic'}
2. If answer is not in the material, say "Not covered in material"
3. NO HALLUCINATION - only use given information
4. Each question MUST have EXACTLY 4 options
5. EXACTLY ONE option is correct
6. All options must be PLAUSIBLE (not obviously wrong)
7. Answer must match the correct option EXACTLY word-for-word
8. Questions should test REAL understanding, not memorization

Return ONLY valid JSON. NO extra text. Format EXACTLY like this:
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Madrid"],
      "answer": "Paris"
    }
  ]
}

DO NOT include letters (A, B, C, D) in options.
Start directly with { and end with }.`;

    const aiResponse = await askHF(prompt, req.user?._id, "flashcards");
    console.log("AI Raw Response:", aiResponse.substring(0, 500));
    
    let parsed = null;
    let jsonString = aiResponse;
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').replace(/'/g, '"').replace(/,(\s*[}\]])/g, '$1');
      parsed = JSON.parse(jsonString);
    }
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid quiz structure");
    }
    
    // Validate and clean each question
    const validatedQuestions = [];
    for (let i = 0; i < parsed.questions.length && i < n; i++) {
      const q = parsed.questions[i];
      const questionText = q.question?.trim();
      if (!questionText || questionText.length < 5) {
        validatedQuestions.push({
          question: `Question ${i + 1}: What is a key concept from the ${fileContent ? 'uploaded material' : topic}?`,
          options: [`Concept A`, `Concept B`, `Concept C`, `Concept D`],
          answer: `Concept A`
        });
        continue;
      }
      
      let options = Array.isArray(q.options) ? q.options.filter(opt => opt && opt.trim()).map(opt => opt.trim()) : [];
      if (options.length !== 4) {
        options = [`Option 1`, `Option 2`, `Option 3`, `Option 4`];
      }
      
      let answer = q.answer?.trim();
      if (!answer || !options.includes(answer)) {
        answer = options[0];
      }
      
      validatedQuestions.push({
        question: questionText,
        options: options,
        answer: answer
      });
    }
    
    while (validatedQuestions.length < n) {
      validatedQuestions.push({
        question: `What is an important concept related to ${fileContent ? 'the uploaded material' : topic}?`,
        options: [`Concept 1`, `Concept 2`, `Concept 3`, `Concept 4`],
        answer: `Concept 1`
      });
    }
    
    const quiz = await Quiz.create({
      user: req.user._id,
      topic: topic || (fileContent ? 'File-based Quiz' : 'General Quiz'),
      questions: validatedQuestions.slice(0, n),
      score: null,
      sourceFile: req.file?.path || null
    });
    
    res.status(201).json(quiz);
  } catch (err) {
    console.error("Failed to generate quiz:", err);
    const fallbackQuestions = [];
    for (let i = 0; i < n; i++) {
      fallbackQuestions.push({
        question: `What is an important aspect of ${topic || 'this topic'}?`,
        options: [`Definition`, `Applications`, `History`, `Future trends`],
        answer: `Definition`
      });
    }
    const fallbackQuiz = await Quiz.create({
      user: req.user._id,
      topic: topic || 'Quiz',
      questions: fallbackQuestions,
      score: null,
    });
    res.status(201).json(fallbackQuiz);
  }
};

/**
 * 3) List all quizzes of current user
 */
exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 4) Get quiz by ID
 */
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });
    res.json(quiz);
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") return res.status(404).json({ message: "Quiz not found" });
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 5) Submit quiz - ACCURATE CHECKING
 */
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });
    
    const { answers } = req.body;
    if (!Array.isArray(answers))
      return res.status(400).json({ message: "Answers must be an array" });
    
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const userAnswer = answers[idx]?.trim() || "";
      const correctAnswer = q.answer?.trim() || "";
      if (userAnswer === correctAnswer) correctCount++;
    });
    
    const scorePercent = quiz.questions.length ? (correctCount / quiz.questions.length) * 100 : 0;
    quiz.score = scorePercent;
    await quiz.save();
    
    res.json({
      scorePercent: Math.round(scorePercent),
      scoreRaw: correctCount,
      total: quiz.questions.length,
      userAnswers: answers,
    });
  } catch (err) {
    console.error(err);
    if (err.kind === "ObjectId") return res.status(404).json({ message: "Quiz not found" });
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 6) Delete quiz
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });
    await quiz.deleteOne();
    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};