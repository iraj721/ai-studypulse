const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const notesController = require('../controllers/notesController');

router.get('/', auth, notesController.getNotes);
router.get('/stats', auth, notesController.getStats); 
router.get('/:id', auth, notesController.getNoteById);
router.post('/', auth, notesController.createNote);
router.put('/:id', auth, notesController.updateNote); 
router.delete('/:id', auth, notesController.deleteNote);

module.exports = router;
