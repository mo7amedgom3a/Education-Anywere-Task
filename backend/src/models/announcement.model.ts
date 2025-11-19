import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  category?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, default: null },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: null },
  },
  { timestamps: true }
);

export const AnnouncementModel = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
