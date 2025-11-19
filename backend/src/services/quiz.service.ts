import { QuizRepository } from '../repositories/quiz.repository';
import {
  QuizDTO,
  QuizInputDTO,
  QuizMapper,
  QuizUpdateDTO,
} from '../dtos/quiz.dto';

const repo = new QuizRepository();

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const normalizeDueDate = (dueDate: Date | string | undefined): Date => {
  if (!dueDate) {
    throw new Error('Due date is required');
  }

  const parsed = dueDate instanceof Date ? dueDate : new Date(dueDate);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid dueDate supplied');
  }

  if (parsed < startOfToday()) {
    throw new Error('Due date cannot be in the past');
  }

  return parsed;
};

export class QuizService {
  async getAll(): Promise<QuizDTO[]> {
    const items = await repo.findAll();
    return QuizMapper.toDTOList(items);
  }

  async getById(id: string): Promise<QuizDTO | null> {
    const item = await repo.findById(id);
    return QuizMapper.toDTO(item);
  }

  async create(data: QuizInputDTO): Promise<QuizDTO> {
    const dueDate = normalizeDueDate(data.dueDate);
    const created = await repo.create({ ...data, dueDate } as any);
    const dto = QuizMapper.toDTO(created);
    if (!dto) {
      throw new Error('Unable to map created quiz');
    }
    return dto;
  }

  async update(id: string, data: QuizUpdateDTO): Promise<QuizDTO | null> {
    const payload = { ...data } as any;
    if (data.dueDate !== undefined) {
      payload.dueDate = normalizeDueDate(data.dueDate);
    }
    const updated = await repo.update(id, payload);
    return QuizMapper.toDTO(updated);
  }

  async remove(id: string) {
    return repo.delete(id);
  }
}
