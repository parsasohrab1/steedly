import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'استیدلی API',
      version: '1.0.0',
      description: 'API documentation for Steedly platform - Comprehensive horse information platform',
      contact: {
        name: 'API Support',
        email: 'support@steedly.ir',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.steedly.ir/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'استیدلی API Documentation',
  }));

  // JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

