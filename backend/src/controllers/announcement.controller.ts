import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcement.service';
import { AnnouncementInputDTO, AnnouncementUpdateDTO } from '../dtos/announcement.dto';
import { uploadToS3 } from '../utils/s3-upload';

const service = new AnnouncementService();

const sanitizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : value);
const normalizeNullable = (value: unknown) => {
  const sanitized = sanitizeString(value);
  if (sanitized === undefined || sanitized === null || sanitized === '') {
    return null;
  }
  return sanitized as string;
};

export class AnnouncementController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await service.getAll();
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await service.getById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Announcement not found' });
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      const payload: AnnouncementInputDTO = {
        title: sanitizeString(req.body.title) as string,
        content: sanitizeString(req.body.content) as string,
        authorName: sanitizeString(req.body.authorName) as string,
        category: normalizeNullable(req.body.category),
        authorAvatar: normalizeNullable(req.body.authorAvatar),
      };

      if (file) {
        payload.authorAvatar = await uploadToS3(file);
      }

      const created = await service.create(payload);
      res.status(201).json({ success: true, message: 'Announcement created', data: created });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      const payload: AnnouncementUpdateDTO = {};

      if (req.body.title !== undefined) payload.title = sanitizeString(req.body.title) as string;
      if (req.body.content !== undefined) payload.content = sanitizeString(req.body.content) as string;
      if (req.body.authorName !== undefined) payload.authorName = sanitizeString(req.body.authorName) as string;
      if (req.body.category !== undefined) payload.category = normalizeNullable(req.body.category);
      if (req.body.authorAvatar !== undefined) payload.authorAvatar = normalizeNullable(req.body.authorAvatar);

      if (file) {
        payload.authorAvatar = await uploadToS3(file);
      }

      const updated = await service.update(req.params.id, payload);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      res.json({ success: true, message: 'Announcement updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await service.remove(req.params.id);
      res.json({ success: true, message: 'Announcement deleted' });
    } catch (err) {
      next(err);
    }
  }
}
