import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import assignmentsRoutes from './routes/assignments.js';
import coursesRoutes from './routes/courses.js';
import dashboardRoutes from './routes/dashboard.js';
import debugRoutes from './routes/debug.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors);
  await app.register(jwtPlugin);
  await app.register(authPlugin);
  await app.register(authRoutes);
  await app.register(assignmentsRoutes);
  await app.register(coursesRoutes);
  await app.register(dashboardRoutes);
  await app.register(debugRoutes);

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
