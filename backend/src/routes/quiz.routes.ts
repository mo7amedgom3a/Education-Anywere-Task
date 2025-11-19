import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
const ctrl = new QuizController();
const ensureDueDateNotPast = (dateValue: unknown) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue as string);
  if (isNaN(date.getTime())) throw new Error('Invalid due date value');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    throw new Error('Due date must be today or in the future');
  }
  return true;
};

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     tags:
 *       - Quizzes
 *     summary: Get all quizzes
 *     responses:
 *       200:
 *         description: A list of quizzes
 */
router.get('/', (req, res, next) => ctrl.getAll(req, res, next));
/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     tags:
 *       - Quizzes
 *     summary: Get a quiz by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the quiz
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A quiz
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', (req, res, next) => ctrl.getById(req, res, next));
/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     tags:
 *       - Quizzes
 *     summary: Create a quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizInput'
 *     responses:
 *       201:
 *         description: Quiz created
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('title').isString().notEmpty(),
    body('course').isString().notEmpty(),
    body('description').optional().isString(),
    body('status').optional().isString(),
    body('dueDate').isISO8601().toDate().custom(ensureDueDateNotPast),
  ],
  validate,
  (req, res, next) => ctrl.create(req, res, next)
);
/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     tags:
 *       - Quizzes
 *     summary: Update a quiz
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true 
 *         description: The ID of the quiz
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz updated
 *       422:
 *         description: Validation error
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizUpdate'
 */
router.put(
  '/:id',
  [
    body('title').optional().isString().notEmpty(),
    body('course').optional().isString().notEmpty(),
    body('description').optional().isString(),
    body('status').optional().isString(),
    body('dueDate').optional().isISO8601().toDate().custom(ensureDueDateNotPast),
  ],
  validate,
  (req, res, next) => ctrl.update(req, res, next)
);
/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     tags:
 *       - Quizzes
 *     summary: Delete a quiz
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the quiz
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz deleted
 *       422:
 *         description: Validation error
 */
router.delete('/:id', (req, res, next) => ctrl.remove(req, res, next));

export default router;
