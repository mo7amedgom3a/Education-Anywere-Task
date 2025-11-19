import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import config from './config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'A sample API for demonstration purposes',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Local development server',
      },
    ],
    tags: [
      {
        name: 'Announcements',
        description: 'Operations related to announcements',
      },
      {
        name: 'Quizzes',
        description: 'Operations related to quizzes',
      },
    ],
    components: {
      schemas: {
        Announcement: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Announcement identifier' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: ['string', 'null'] },
            authorName: { type: 'string' },
            authorAvatar: { type: ['string', 'null'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AnnouncementInput: {
          type: 'object',
          required: ['title', 'content', 'authorName'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            authorName: { type: 'string' },
            category: { type: 'string', nullable: true },
            authorAvatar: { type: 'string', nullable: true },
          },
        },
        AnnouncementUpdate: {
          type: 'object',
          description: 'Partial fields to update on an announcement',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            authorName: { type: 'string' },
            category: { type: 'string', nullable: true },
            authorAvatar: { type: 'string', nullable: true },
          },
        },
        Quiz: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            course: { type: 'string' },
            description: { type: ['string', 'null'] },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        QuizInput: {
          type: 'object',
          required: ['title', 'course', 'dueDate'],
          properties: {
            title: { type: 'string' },
            course: { type: 'string' },
            description: { type: 'string', nullable: true },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
          },
        },
        QuizUpdate: {
          type: 'object',
          description: 'Fields that can be updated on a quiz',
          properties: {
            title: { type: 'string' },
            course: { type: 'string' },
            description: { type: 'string', nullable: true },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, './routes/*.ts'),
    path.join(__dirname, './routes/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;

