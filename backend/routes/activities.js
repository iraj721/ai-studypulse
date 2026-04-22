const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  createActivity, 
  getUserActivities, 
  getStats, 
  deleteActivity 
} = require('../controllers/activitiesController');

router.get('/', auth, getUserActivities);
router.get('/stats', auth, getStats);
router.post('/', auth, createActivity);
router.delete('/:id', auth, deleteActivity);

module.exports = router;
