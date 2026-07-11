const communityRepository = require('../repositories/community.repository');

class CommunityService {
  async getPosts(gameId) {
    return await communityRepository.getPosts(gameId);
  }

  async getReplies(gameId, postId) {
    return await communityRepository.getReplies(gameId, postId);
  }

  async createPost(gameId, userId, title, content) {
    const postRecord = await communityRepository.createPost(gameId, userId, title, content);
    const nickname = await communityRepository.getUserNickname(userId);
    return { ...postRecord, author: nickname || 'Anónimo', replies: '0' };
  }

  async createReply(gameId, postId, userId, content) {
    const replyRecord = await communityRepository.createReply(gameId, postId, userId, content);
    const nickname = await communityRepository.getUserNickname(userId);
    return { ...replyRecord, author: nickname || 'Anónimo' };
  }

  async likePost(gameId, postId) {
    return await communityRepository.likePost(gameId, postId);
  }

  async likeReply(gameId, replyId) {
    return await communityRepository.likeReply(gameId, replyId);
  }
}

module.exports = new CommunityService();
