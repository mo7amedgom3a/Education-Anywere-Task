import { Router } from 'express';
import { AnnouncementController } from '../controllers/announcement.controller';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';
import upload from '../middlewares/upload';

const router = Router();
const ctrl = new AnnouncementController();
/**
 * @swagger
 * /api/announcements:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get all announcements
 *     responses:
 *       200:
 *         description: A list of announcements
 */
router.get('/', (req, res, next) => ctrl.getAll(req, res, next));
/**
 * @swagger
 * /api/announcements/{id}:
 *   get:
 *     tags:
 *       - Announcements
 *     summary: Get an announcement by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the announcement
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The announcement
 *       404:
 *         description: Announcement not found
 */
router.get('/:id', (req, res, next) => ctrl.getById(req, res, next));
/**
 * @swagger
 * /api/announcements:
 *   post:
 *     tags:
 *       - Announcements
 *     summary: Create an announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnouncementInput'
 *     responses:
 *       201:
 *         description: Announcement created
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  upload.single('authorAvatar'),
  [
    body('title').isString().trim().notEmpty(),
    body('content').isString().notEmpty(),
    body('authorName').isString().notEmpty(),
    body('category').optional().isString().trim(),
    body('authorAvatar').optional().isString().trim(),
  ],
  validate,
  (req, res, next) => ctrl.create(req, res, next)
);
/**
 * @swagger
 * /api/announcements/{id}:
 *   put:
 *     tags:
 *       - Announcements
 *     summary: Update an announcement
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the announcement
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement updated
 *       422:
 *         description: Validation error
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnnouncementUpdate'
 */
router.put(
  '/:id',
  upload.single('authorAvatar'),
  [
    body('title').optional().isString().trim().notEmpty(),
    body('content').optional().isString().notEmpty(),
    body('authorName').optional().isString().notEmpty(),
    body('category').optional().isString().trim(),
    body('authorAvatar').optional().isString().trim(),
  ],
  validate,
  (req, res, next) => ctrl.update(req, res, next)
);
/**
 * @swagger
 * /api/announcements/{id}:
 *   delete:
 *     tags:
 *       - Announcements
 *     summary: Delete an announcement
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the announcement
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Announcement deleted
 *       422:
 *         description: Validation error
 */
router.delete('/:id', (req, res, next) => ctrl.remove(req, res, next));

export default router;
