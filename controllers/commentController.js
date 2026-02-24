const CommentService = require('../services/commentService');
const { Ticket } = require('../models');

const createComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    
    const userIdStr = req.user.id;
    const createdByStr = ticket.created_by.toString();
    const assignedToStr = ticket.assigned_to ? ticket.assigned_to.toString() : null;

    if (req.user.role === 'USER' && createdByStr !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only ticket owner can comment.'
      });
    }

    if (req.user.role === 'SUPPORT' && assignedToStr !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only assigned SUPPORT can comment.'
      });
    }

    const newComment = await CommentService.createComment(id, req.user.id, comment);

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await CommentService.getComments(id, req.user.role, req.user.id);

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    if (error.message === 'Ticket not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Access denied') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const updatedComment = await CommentService.updateComment(
      id,
      req.user.id,
      req.user.role,
      comment
    );

    res.status(200).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await CommentService.deleteComment(id, req.user.id, req.user.role);

    res.status(204).send();
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};
