const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getPosts, createPost, toggleLike, addComment, getUserPosts } = require('../controllers/postController');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.get('/user/:userId', protect, getUserPosts);

module.exports = router;
