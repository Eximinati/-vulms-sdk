import type { FastifyInstance } from 'fastify';
import { getAuthenticatedSdk, SessionMissingError, SessionInvalidError } from '../services/sdk-factory.js';
import {
  toHomeCourseDto,
  toHomeDashboardDto,
  toHomeAssignmentDto,
  getRecentAssignments,
} from '../mappers/home.js';
import { toAssignmentSummaryDto } from '../mappers/assignment.js';
import type { HomeResponseDto } from '../types/home.js';

export default async function homeRoutes(app: FastifyInstance) {
  app.get('/api/home', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;
    const start = Date.now();

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);

      const [courses, dashboard, summary, allAssignments] = await Promise.all([
        sdk.getCourses(),
        sdk.dashboard.getAll(),
        sdk.assignments.getSummary(),
        sdk.assignments.getAssignments(),
      ]);

      const recent = getRecentAssignments(allAssignments, 5);

      const response: HomeResponseDto = {
        meta: { generatedAt: new Date().toISOString() },
        student: { studentId },
        courses: courses.map(toHomeCourseDto),
        dashboard: dashboard.map(toHomeDashboardDto),
        assignments: {
          summary: toAssignmentSummaryDto(summary),
          recent: recent.map(toHomeAssignmentDto),
        },
      };

      const duration = Date.now() - start;
      app.log.info(`home endpoint completed in ${duration}ms`);

      return reply.code(200).send(response);
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
