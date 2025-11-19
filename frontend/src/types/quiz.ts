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
