const TicketService = require('../services/ticketService');

const createTicket = async (req, res, next) => {
  try {
    const ticket = await TicketService.createTicket(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const tickets = await TicketService.getTicketsForUser(req.user.role, req.user.id);

    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await TicketService.getTicketById(id, req.user.role, req.user.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'assigned_to is required'
      });
    }

    const ticket = await TicketService.assignTicket(id, assigned_to, req.user.role);

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    if (error.message === 'Ticket not found' || error.message === 'Assignee not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('Cannot assign ticket to USER role')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required'
      });
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED'
      });
    }

    const ticket = await TicketService.updateStatus(id, status, req.user.id);

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TicketService.deleteTicket(id);

    res.status(204).send();
  } catch (error) {
    if (error.message === 'Ticket not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateStatus,
  deleteTicket
};

