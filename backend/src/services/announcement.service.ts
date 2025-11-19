import { AnnouncementRepository } from '../repositories/announcement.repository';
import {
  AnnouncementDTO,
  AnnouncementInputDTO,
  AnnouncementMapper,
  AnnouncementUpdateDTO,
} from '../dtos/announcement.dto';

const repo = new AnnouncementRepository();

export class AnnouncementService {
  async getAll(): Promise<AnnouncementDTO[]> {
    const items = await repo.findAll();
    return AnnouncementMapper.toDTOList(items);
  }

  async getById(id: string): Promise<AnnouncementDTO | null> {
    const item = await repo.findById(id);
    return AnnouncementMapper.toDTO(item);
  }

  async create(data: AnnouncementInputDTO): Promise<AnnouncementDTO> {
    const created = await repo.create(data as any);
    const dto = AnnouncementMapper.toDTO(created);
    if (!dto) {
      throw new Error('Unable to map created announcement');
    }
    return dto;
  }

  async update(id: string, data: AnnouncementUpdateDTO): Promise<AnnouncementDTO | null> {
    const updated = await repo.update(id, data as any);
    return AnnouncementMapper.toDTO(updated);
  }

  async remove(id: string) {
    return repo.delete(id);
  }
}
