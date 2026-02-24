const { TicketComment, Ticket, User } = require('../models');

class CommentService {
  static async createComment(ticketId, userId, comment) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const newComment = await TicketComment.create({
      ticket_id: ticketId,
      user_id: userId,
      comment
    });

    return await TicketComment.findById(newComment._id)
      .populate('ticket_id', 'title')
      .populate('user_id', 'name email');
  }

  static async getComments(ticketId, userRole, userId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check access (MANAGER has access to all tickets)
    if (userRole !== 'MANAGER') {
      const userIdStr = userId.toString();
      const createdByStr = ticket.created_by.toString();
      const assignedToStr = ticket.assigned_to ? ticket.assigned_to.toString() : null;

      if (userRole === 'USER' && createdByStr !== userIdStr) {
        throw new Error('Access denied');
      }
      if (userRole === 'SUPPORT' && assignedToStr !== userIdStr) {
        throw new Error('Access denied');
      }
    }

    return await TicketComment.find({ ticket_id: ticketId })
      .populate('user_id', 'name email')
      .sort({ created_at: 1 });
  }

  static async updateComment(commentId, userId, userRole, newComment) {
    const comment = await TicketComment.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check permission - convert ObjectId to string for comparison
    const userIdStr = userId.toString();
    const commentUserIdStr = comment.user_id.toString();

    if (userRole !== 'MANAGER' && commentUserIdStr !== userIdStr) {
      throw new Error('Access denied. Only MANAGER or comment author can update.');
    }

    comment.comment = newComment;
    await comment.save();

    return await TicketComment.findById(commentId)
      .populate('ticket_id', 'title')
      .populate('user_id', 'name email');
  }

  static async deleteComment(commentId, userId, userRole) {
    const comment = await TicketComment.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check permission - convert ObjectId to string for comparison
    const userIdStr = userId.toString();
    const commentUserIdStr = comment.user_id.toString();

    if (userRole !== 'MANAGER' && commentUserIdStr !== userIdStr) {
      throw new Error('Access denied. Only MANAGER or comment author can delete.');
    }

    await TicketComment.findByIdAndDelete(commentId);
    return true;
  }
}

module.exports = CommentService;
