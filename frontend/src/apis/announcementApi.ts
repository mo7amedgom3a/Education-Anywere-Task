import { AnnouncementDTO, AnnouncementInputDTO, AnnouncementUpdateDTO } from '@/types/announcement';
import { ApiMessageResponse, ApiSuccessResponse, httpClient } from './httpClient';

type AnnouncementApiModel = Omit<AnnouncementDTO, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

const mapAnnouncement = (payload: AnnouncementApiModel): AnnouncementDTO => ({
  ...payload,
  category: payload.category ?? null,
  authorAvatar: payload.authorAvatar ?? null,
  createdAt: new Date(payload.createdAt),
  updatedAt: new Date(payload.updatedAt),
});

export const announcementApi = {
  async getAll() {
    const response = await httpClient.get<ApiSuccessResponse<AnnouncementApiModel[]>>('/api/announcements');
    return response.data.map(mapAnnouncement);
  },

  async getById(id: string) {
    const response = await httpClient.get<ApiSuccessResponse<AnnouncementApiModel>>(`/api/announcements/${id}`);
    return mapAnnouncement(response.data);
  },

  async create(payload: AnnouncementInputDTO) {
    const response = await httpClient.post<ApiSuccessResponse<AnnouncementApiModel>>('/api/announcements', payload);
    return mapAnnouncement(response.data);
  },

  async update(id: string, payload: AnnouncementUpdateDTO) {
    const response = await httpClient.put<ApiSuccessResponse<AnnouncementApiModel>>(
      `/api/announcements/${id}`,
      payload,
    );
    return mapAnnouncement(response.data);
  },

  async remove(id: string) {
    await httpClient.delete<ApiMessageResponse>(`/api/announcements/${id}`);
    return true;
  },
};

