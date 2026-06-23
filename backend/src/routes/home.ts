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

function timed<T>(label: string, fn: Promise<T>): Promise<T> {
  const start = Date.now();
  return fn.then((result) => {
    console.log(`[PERF] ${label}: ${Date.now() - start}ms`);
    return result;
  });
}

export default async function homeRoutes(app: FastifyInstance) {
  app.get('/api/home', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;
    const totalStart = Date.now();

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);

      const courses = await timed('getCourses', sdk.getCourses());
      const dashboard = await timed('getDashboard', sdk.dashboard.getAll());
      const summary = await timed('getAssignmentSummary', sdk.assignments.getSummary());
      const allAssignments = await timed('getAssignments', sdk.assignments.getAssignments());

      const recent = getRecentAssignments(allAssignments, 5);

      console.log(`[PERF] homeTotal: ${Date.now() - totalStart}ms`);

      // Deep per-course assignment timing
      console.log(`[PERF] --- Per-Course Assignment Traversal ---`);
      const courseCodes = dashboard.map(d => d.courseCode);
      for (const code of courseCodes) {
        const cStart = Date.now();
        await sdk.assignments.getAssignments(code);
        console.log(`[PERF] ${code}: ${Date.now() - cStart}ms`);
      }
      console.log(`[PERF] --- End Per-Course ---`);

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
