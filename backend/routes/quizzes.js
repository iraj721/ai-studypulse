const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/quizzesController');
const { uploadStudyMaterial } = require('../middleware/cloudinaryUpload');

router.get('/weak-topics', auth, controller.getWeakTopics);
router.get('/', auth, controller.listQuizzes);
router.get('/:id', auth, controller.getQuiz);
router.post('/generate', auth, uploadStudyMaterial.single('file'), controller.generateQuiz);
router.post('/:id/submit', auth, controller.submitQuiz);
router.delete('/:id', auth, controller.deleteQuiz);

module.exports = router;