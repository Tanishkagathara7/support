const mongoose = require('mongoose');

const ticketCommentSchema = new mongoose.Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

ticketCommentSchema.index({ ticket_id: 1 });

const TicketComment = mongoose.model('TicketComment', ticketCommentSchema);

module.exports = TicketComment;
