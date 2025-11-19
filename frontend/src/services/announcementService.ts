import { announcementApi } from '@/apis/announcementApi';
import { AnnouncementDTO, AnnouncementInputDTO, AnnouncementUpdateDTO } from '@/types/announcement';

export const announcementService = {
  async getAll(): Promise<AnnouncementDTO[]> {
    return announcementApi.getAll();
  },

  async getById(id: string): Promise<AnnouncementDTO | null> {
    try {
      return await announcementApi.getById(id);
    } catch {
      return null;
    }
  },

  async create(data: AnnouncementInputDTO): Promise<AnnouncementDTO> {
    return announcementApi.create(data);
  },

  async update(id: string, data: AnnouncementUpdateDTO): Promise<AnnouncementDTO | null> {
    try {
      return await announcementApi.update(id, data);
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await announcementApi.remove(id);
      return true;
    } catch {
      return false;
    }
  },
};
