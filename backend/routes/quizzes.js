// backend/routes/quizzes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/quizzesController');

router.get('/weak-topics', auth, controller.getWeakTopics);

// new quiz APIs
router.get('/', auth, controller.listQuizzes);
router.get('/:id', auth, controller.getQuiz);
router.post('/generate', auth, controller.generateQuiz);
router.post('/:id/submit', auth, controller.submitQuiz);
router.delete('/:id', auth, controller.deleteQuiz);


module.exports = router;
