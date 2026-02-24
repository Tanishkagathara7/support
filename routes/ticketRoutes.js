const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createTicket,
  getTickets,
  getTicketById,
  assignTicket,
  updateStatus,
  deleteTicket
} = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

const createTicketValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Priority must be LOW, MEDIUM, or HIGH'),
  validationMiddleware
];

const assignTicketValidation = [
  body('assigned_to')
    .notEmpty()
    .withMessage('assigned_to is required')
    .isMongoId()
    .withMessage('assigned_to must be a valid MongoDB ObjectId'),
  validationMiddleware
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .withMessage('Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED'),
  validationMiddleware
];

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket (USER, MANAGER)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 example: System not responding
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: The system is not responding to my requests
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *                 example: HIGH
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('USER', 'MANAGER'),
  createTicketValidation,
  createTicket
);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get tickets (filtered by role)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - MANAGER: Gets all tickets
 *       - SUPPORT: Gets assigned tickets only
 *       - USER: Gets own tickets only
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware,
  getTickets
);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket details
 *       404:
 *         description: Ticket not found or access denied
 */
router.get(
  '/:id',
  authMiddleware,
  getTicketById
);

/**
 * @swagger
 * /tickets/{id}/assign:
 *   patch:
 *     summary: Assign ticket to a user (MANAGER, SUPPORT)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_to
 *             properties:
 *               assigned_to:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       400:
 *         description: Validation error or cannot assign to USER role
 *       403:
 *         description: Forbidden
 */
router.patch(
  '/:id/assign',
  authMiddleware,
  roleMiddleware('MANAGER', 'SUPPORT'),
  assignTicketValidation,
  assignTicket
);

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status (MANAGER, SUPPORT)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 */
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('MANAGER', 'SUPPORT'),
  updateStatusValidation,
  updateStatus
);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete ticket (MANAGER only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ticket deleted successfully
 *       403:
 *         description: Forbidden - MANAGER role required
 *       404:
 *         description: Ticket not found
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('MANAGER'),
  deleteTicket
);

module.exports = router;

