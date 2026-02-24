const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

const commentValidation = [
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 1 })
    .withMessage('Comment cannot be empty'),
  validationMiddleware
];

/**
 * @swagger
 * /tickets/{id}/comments:
 *   post:
 *     summary: Create a comment on a ticket
 *     tags: [Comments]
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
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: Looking into this issue
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 */
router.post(
  '/tickets/:id/comments',
  authMiddleware,
  commentValidation,
  createComment
);

/**
 * @swagger
 * /tickets/{id}/comments:
 *   get:
 *     summary: Get all comments for a ticket
 *     tags: [Comments]
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
 *         description: List of comments
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 */
router.get(
  '/tickets/:id/comments',
  authMiddleware,
  getComments
);

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
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
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Access denied - Only MANAGER or comment author
 *       404:
 *         description: Comment not found
 */
router.patch(
  '/comments/:id',
  authMiddleware,
  commentValidation,
  updateComment
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
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
 *         description: Comment deleted successfully
 *       403:
 *         description: Access denied - Only MANAGER or comment author
 *       404:
 *         description: Comment not found
 */
router.delete(
  '/comments/:id',
  authMiddleware,
  deleteComment
);

module.exports = router;

