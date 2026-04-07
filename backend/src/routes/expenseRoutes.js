import { Router } from 'express';
import { body } from 'express-validator';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { CATEGORIES } from '../models/Expense.js';

const router = Router();

// All routes are protected
router.use(protect);

// Stats route (must be before /:id to avoid conflict)
router.get('/stats', getExpenseStats);

router.get('/', getExpenses);

router.post(
  '/',
  [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('category')
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  createExpense
);

router.put(
  '/:id',
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('category')
      .optional()
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Description cannot exceed 200 characters'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  updateExpense
);

router.delete('/:id', deleteExpense);

export default router;
