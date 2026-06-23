import type { FastifyInstance } from 'fastify';
import { getAuthenticatedSdk, SessionMissingError, SessionInvalidError } from '../services/sdk-factory.js';

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get('/api/dashboard', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const courses = await sdk.dashboard.getAll();

      return reply.code(200).send({
        data: courses.map(c => ({
          courseCode: c.courseCode,
          hasAssignments: c.hasAssignments ?? false,
          hasQuizzes: c.hasQuizzes ?? false,
          hasGDBs: c.hasGDBs ?? false,
          hasLectures: c.hasLectures ?? false,
        })),
      });
    } catch (e) {
      if (e instanceof SessionMissingError) {
        return reply.code(401).send({ error: 'Session Not Found', message: e.message });
      }
      if (e instanceof SessionInvalidError) {
        return reply.code(401).send({ error: 'Session Invalid', message: e.message });
      }
      const msg = e instanceof Error ? e.message : String(e);
      return reply.code(500).send({ error: 'SDK Error', message: msg });
    }
  });
}
