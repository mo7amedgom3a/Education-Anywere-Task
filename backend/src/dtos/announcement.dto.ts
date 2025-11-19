import { IAnnouncement } from '../models/announcement.model';

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

const normalizeNullable = (value?: string | null) => (value ?? null);

export const AnnouncementMapper = {
  toDTO(entity: (IAnnouncement & { id?: string }) | (Partial<IAnnouncement> & { _id?: any }) | null): AnnouncementDTO | null {
    if (!entity) return null;

    const source: any = typeof entity.toObject === 'function' ? entity.toObject() : entity;

    return {
      id: source._id?.toString ? source._id.toString() : source.id ?? '',
      title: source.title,
      content: source.content,
      category: normalizeNullable(source.category),
      authorName: source.authorName,
      authorAvatar: normalizeNullable(source.authorAvatar),
      createdAt: new Date(source.createdAt),
      updatedAt: new Date(source.updatedAt),
    };
  },

  toDTOList(entities: any[]): AnnouncementDTO[] {
    return entities.map(entity => {
      const dto = AnnouncementMapper.toDTO(entity);
      if (!dto) {
        throw new Error('Failed to map announcement entity');
      }
      return dto;
    });
  },
};

