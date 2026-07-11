const express = require('express');
const router = express.Router({ mergeParams: true });
const communityController = require('../controllers/communityController');
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (anyone can read)
router.get('/:gameId/news', newsController.getNewsByGame);
router.get('/:gameId/posts', communityController.getPosts);
router.get('/:gameId/posts/:postId/replies', communityController.getReplies);

// Protected routes (must be logged in)
router.post('/:gameId/posts', authMiddleware, communityController.createPost);
router.post('/:gameId/posts/:postId/replies', authMiddleware, communityController.createReply);
router.post('/:gameId/posts/:postId/like', authMiddleware, communityController.likePost);
router.post('/:gameId/replies/:replyId/like', authMiddleware, communityController.likeReply);

module.exports = router;
