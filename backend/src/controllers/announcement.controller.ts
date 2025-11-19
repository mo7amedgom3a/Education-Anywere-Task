import { Request, Response, NextFunction } from 'express';
import { AnnouncementService } from '../services/announcement.service';
const service = new AnnouncementService();

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
      const created = await service.create(req.body);
      res.status(201).json({ success: true, message: 'Announcement created', data: created });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await service.update(req.params.id, req.body);
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
