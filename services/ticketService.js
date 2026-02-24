const { Ticket, User, Role, TicketStatusLog } = require('../models');
const { isValidTransition } = require('../utils/statusTransition');

class TicketService {
  static async createTicket(data, userId) {
    const ticket = await Ticket.create({
      ...data,
      created_by: userId,
      status: 'OPEN'
    });

    return await Ticket.findById(ticket._id)
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email');
  }

  static async getTicketsForUser(userRole, userId) {
    let query = {};

    if (userRole === 'USER') {
      query.created_by = userId;
    } else if (userRole === 'SUPPORT') {
      query.assigned_to = userId;
    }
    // MANAGER sees all tickets (no query filter)

    return await Ticket.find(query)
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email')
      .sort({ created_at: -1 });
  }

  static async getTicketById(id, userRole, userId) {
    const ticket = await Ticket.findById(id)
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email');

    if (!ticket) {
      return null;
    }

    // Check access - convert ObjectId to string for comparison
    const userIdStr = userId.toString();
    const createdByStr = ticket.created_by._id ? ticket.created_by._id.toString() : ticket.created_by.toString();
    const assignedToStr = ticket.assigned_to ? 
      (ticket.assigned_to._id ? ticket.assigned_to._id.toString() : ticket.assigned_to.toString()) : null;

    if (userRole === 'USER' && createdByStr !== userIdStr) {
      return null;
    }
    if (userRole === 'SUPPORT' && assignedToStr !== userIdStr) {
      return null;
    }

    return ticket;
  }

  static async assignTicket(ticketId, assigneeId, userRole) {
    // Verify assignee is SUPPORT or MANAGER
    const assignee = await User.findById(assigneeId).populate('role_id');

    if (!assignee) {
      throw new Error('Assignee not found');
    }

    const role = await Role.findById(assignee.role_id);
    if (!role || role.name === 'USER') {
      throw new Error('Cannot assign ticket to USER role. Only SUPPORT or MANAGER can be assigned.');
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.assigned_to = assigneeId;
    await ticket.save();

    return await Ticket.findById(ticketId)
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email');
  }

  static async updateStatus(ticketId, newStatus, userId) {
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const oldStatus = ticket.status;

    if (!isValidTransition(oldStatus, newStatus)) {
      throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    }

    ticket.status = newStatus;
    await ticket.save();

    // Log status change
    await TicketStatusLog.create({
      ticket_id: ticketId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: userId
    });

    return await Ticket.findById(ticketId)
      .populate('created_by', 'name email')
      .populate('assigned_to', 'name email');
  }

  static async deleteTicket(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    await Ticket.findByIdAndDelete(ticketId);
    return true;
  }
}

module.exports = TicketService;
