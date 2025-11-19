import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import announcementRoutes from './routes/announcement.routes';
import quizRoutes from './routes/quiz.routes';
import { errorHandler } from './middlewares/error.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerDef';
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => res.json({ success: true, message: 'API is running' }));
app.get('/swagger.json', (_req, res) => {
  res.type('application/json').send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/announcements', announcementRoutes);
app.use('/api/quizzes', quizRoutes);

app.use(errorHandler);

export default app;
