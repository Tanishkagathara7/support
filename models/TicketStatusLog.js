const mongoose = require('mongoose');

const ticketStatusLogSchema = new mongoose.Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  old_status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: null
  },
  new_status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    required: true
  },
  changed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

ticketStatusLogSchema.index({ ticket_id: 1 });

const TicketStatusLog = mongoose.model('TicketStatusLog', ticketStatusLogSchema);

module.exports = TicketStatusLog;
