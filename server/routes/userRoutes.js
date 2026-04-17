const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUser, updateUser, searchUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);

module.exports = router;
