import type { FastifyInstance } from 'fastify';
import { getAuthenticatedSdk, SessionMissingError, SessionInvalidError } from '../services/sdk-factory.js';
import { toAssignmentDto, toAssignmentSummaryDto } from '../mappers/assignment.js';

export default async function assignmentsRoutes(app: FastifyInstance) {
  app.get('/api/assignments', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    const { courseCode } = request.query as { courseCode?: string };

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const assignments = await sdk.assignments.getAssignments(courseCode);

      return reply.code(200).send({
        data: assignments.map(toAssignmentDto),
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

  app.get('/api/assignments/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const summary = await sdk.assignments.getSummary();

      return reply.code(200).send({
        summary: toAssignmentSummaryDto(summary),
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
