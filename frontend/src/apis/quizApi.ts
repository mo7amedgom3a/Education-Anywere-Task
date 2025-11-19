import { QuizDTO, QuizInputDTO, QuizUpdateDTO } from '@/types/quiz';
import { ApiMessageResponse, ApiSuccessResponse, httpClient } from './httpClient';

type QuizApiModel = Omit<QuizDTO, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

const mapQuiz = (payload: QuizApiModel): QuizDTO => ({
  ...payload,
  description: payload.description ?? null,
  dueDate: new Date(payload.dueDate),
  createdAt: new Date(payload.createdAt),
  updatedAt: new Date(payload.updatedAt),
});

export const quizApi = {
  async getAll() {
    const response = await httpClient.get<ApiSuccessResponse<QuizApiModel[]>>('/api/quizzes');
    return response.data.map(mapQuiz);
  },

  async getById(id: string) {
    const response = await httpClient.get<ApiSuccessResponse<QuizApiModel>>(`/api/quizzes/${id}`);
    return mapQuiz(response.data);
  },

  async create(payload: QuizInputDTO) {
    const response = await httpClient.post<ApiSuccessResponse<QuizApiModel>>('/api/quizzes', payload);
    return mapQuiz(response.data);
  },

  async update(id: string, payload: QuizUpdateDTO) {
    const response = await httpClient.put<ApiSuccessResponse<QuizApiModel>>(`/api/quizzes/${id}`, payload);
    return mapQuiz(response.data);
  },

  async remove(id: string) {
    await httpClient.delete<ApiMessageResponse>(`/api/quizzes/${id}`);
    return true;
  },
};

