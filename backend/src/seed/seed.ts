import { connectDB } from '../data/mongo';
import { AnnouncementModel } from '../models/announcement.model';
import { QuizModel } from '../models/quiz.model';

const run = async () => {
  await connectDB();
  await AnnouncementModel.deleteMany({});
  await QuizModel.deleteMany({});

  await AnnouncementModel.create([
    {
      title: 'Welcome to the semester',
      content: 'We wish you a great semester!',
      category: 'General',
      authorName: 'School management',
      authorAvatar: null
    },
    {
      title: 'Field trip reminder',
      content: "Don't forget the field trip next week.",
      category: 'Events',
      authorName: 'Events Manager',
      authorAvatar: null
    }
  ]);

  await QuizModel.create([
    {
      title: 'Unit 2 Quiz',
      course: 'Physics 102',
      description: 'Mechanics and Forces',
      status: 'pending',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
    },
    {
      title: '12-12 Assignment',
      course: 'English 101',
      description: 'Reading comprehension',
      status: 'pending',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  ]);

  console.log('Seed finished');
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
