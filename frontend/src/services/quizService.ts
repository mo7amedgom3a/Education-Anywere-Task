import { quizApi } from '@/apis/quizApi';
import { QuizDTO, QuizInputDTO, QuizUpdateDTO } from '@/types/quiz';

export const quizService = {
  async getAll(): Promise<QuizDTO[]> {
    return quizApi.getAll();
  },

  async getById(id: string): Promise<QuizDTO | null> {
    try {
      return await quizApi.getById(id);
    } catch {
      return null;
    }
  },

  async create(data: QuizInputDTO): Promise<QuizDTO> {
    return quizApi.create(data);
  },

  async update(id: string, data: QuizUpdateDTO): Promise<QuizDTO | null> {
    try {
      return await quizApi.update(id, data);
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await quizApi.remove(id);
      return true;
    } catch {
      return false;
    }
  },
};
