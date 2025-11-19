export interface AnnouncementDTO {
  id: string;
  title: string;
  content: string;
  category: string | null;
  authorName: string;
  authorAvatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementInputDTO {
  title: string;
  content: string;
  authorName: string;
  category?: string | null;
  authorAvatar?: string | null;
}

export type AnnouncementUpdateDTO = Partial<AnnouncementInputDTO>;
