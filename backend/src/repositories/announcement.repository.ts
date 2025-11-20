import { SortOrder } from 'mongoose';
import { AnnouncementModel, IAnnouncement } from '../models/announcement.model';

export class AnnouncementRepository {
  async findAll(sort: Record<string, SortOrder> = { createdAt: -1 }) {
    return AnnouncementModel.find().sort(sort).lean();
  }

  async findById(id: string) {
    return AnnouncementModel.findById(id).lean();
  }

  async create(payload: Partial<IAnnouncement>) {
    const created = await AnnouncementModel.create(payload);
    return created.toObject();
  }

  async update(id: string, payload: Partial<IAnnouncement>) {
    return AnnouncementModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  async delete(id: string) {
    return AnnouncementModel.findByIdAndDelete(id).lean();
  }
}
