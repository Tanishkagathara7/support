const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
