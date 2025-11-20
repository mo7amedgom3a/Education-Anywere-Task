import { SortOrder } from 'mongoose';
import { QuizModel, IQuiz } from '../models/quiz.model';

export class QuizRepository {
  async findAll(sort: Record<string, SortOrder> = { dueDate: 1 }) {
    return QuizModel.find().sort(sort).lean();
  }

  async findById(id: string) {
    return QuizModel.findById(id).lean();
  }

  async create(payload: Partial<IQuiz>) {
    const created = await QuizModel.create(payload);
    return created.toObject();
  }

  async update(id: string, payload: Partial<IQuiz>) {
    return QuizModel.findByIdAndUpdate(id, payload, { new: true }).lean();
  }

  async delete(id: string) {
    return QuizModel.findByIdAndDelete(id).lean();
  }
}
