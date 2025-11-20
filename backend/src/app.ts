import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import announcementRoutes from './routes/announcement.routes';
import quizRoutes from './routes/quiz.routes';
import { errorHandler } from './middlewares/error.middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerDef';
import { s3Client } from './config/s3';
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/', (req, res) => res.json({ success: true, message: 'API is running' }));
app.get('/files/:key(*)', async (req, res, next) => {
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const key = decodeURIComponent(req.params.key);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const data = await s3Client.send(command);
    if (!data.Body) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (data.ContentType) {
      res.setHeader('Content-Type', data.ContentType);
    }
    if (data.ContentLength) {
      res.setHeader('Content-Length', data.ContentLength.toString());
    }

    (data.Body as Readable).pipe(res);
  } catch (err) {
    next(err);
  }
});
app.get('/swagger.json', (_req, res) => {
  res.type('application/json').send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/announcements', announcementRoutes);
app.use('/api/quizzes', quizRoutes);

app.use(errorHandler);

export default app;
