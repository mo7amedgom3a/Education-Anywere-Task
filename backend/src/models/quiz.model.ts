import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  course: string;
  description?: string | null;
  dueDate: Date;
  status: 'pending' | 'completed' | string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true },
    description: { type: String, default: null },
    dueDate: { type: Date, required: true },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

export const QuizModel = mongoose.model<IQuiz>('Quiz', QuizSchema);
