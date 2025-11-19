import { IQuiz } from '../models/quiz.model';

export interface QuizDTO {
  id: string;
  title: string;
  course: string;
  description: string | null;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizInputDTO {
  title: string;
  course: string;
  dueDate: Date | string;
  description?: string | null;
  status?: string;
}

export type QuizUpdateDTO = Partial<Omit<QuizInputDTO, 'dueDate'>> & {
  dueDate?: Date | string;
};

const normalizeNullable = (value?: string | null) => (value ?? null);

const normalizeDate = (value: Date | string): Date => {
  const parsed = value instanceof Date ? value : new Date(value);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date');
  }
  return parsed;
};

export const QuizMapper = {
  toDTO(entity: (IQuiz & { id?: string }) | (Partial<IQuiz> & { _id?: any }) | null): QuizDTO | null {
    if (!entity) return null;

    const source: any = typeof entity.toObject === 'function' ? entity.toObject() : entity;

    return {
      id: source._id?.toString ? source._id.toString() : source.id ?? '',
      title: source.title,
      course: source.course,
      description: normalizeNullable(source.description),
      dueDate: normalizeDate(source.dueDate),
      status: source.status,
      createdAt: normalizeDate(source.createdAt),
      updatedAt: normalizeDate(source.updatedAt),
    };
  },

  toDTOList(entities: any[]): QuizDTO[] {
    return entities.map(entity => {
      const dto = QuizMapper.toDTO(entity);
      if (!dto) {
        throw new Error('Failed to map quiz entity');
      }
      return dto;
    });
  },
};

