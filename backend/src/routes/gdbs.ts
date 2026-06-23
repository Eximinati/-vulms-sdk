import type { FastifyInstance } from 'fastify';
import { getAuthenticatedSdk, SessionMissingError, SessionInvalidError } from '../services/sdk-factory.js';
import { toGdbDto, toGdbSummaryDto } from '../mappers/gdb.js';

export default async function gdbsRoutes(app: FastifyInstance) {
  app.get('/api/gdbs', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;
    const { courseCode } = request.query as { courseCode?: string };

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const gdbs = await sdk.gdb.getGDBs(courseCode);
      console.log(`[GDB-PERF] getGDBs: ${Date.now() - t0}ms`);

      return reply.code(200).send({
        data: gdbs.map(toGdbDto),
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

  app.get('/api/gdbs/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const summary = await sdk.gdb.getSummary();
      console.log(`[GDB-PERF] getSummary: ${Date.now() - t0}ms`);

      return reply.code(200).send({
        summary: toGdbSummaryDto(summary),
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

  app.get('/api/gdbs/pending', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const agg = await sdk.gdb.getAll();
      console.log(`[GDB-PERF] getPending: ${Date.now() - t0}ms`);

      const pending = agg.gdbs
        .filter(g => g.status === 'pending')
        .sort((a, b) => {
          const aTime = a.dueDate instanceof Date ? a.dueDate.getTime() : 0;
          const bTime = b.dueDate instanceof Date ? b.dueDate.getTime() : 0;
          return aTime - bTime;
        });

      return reply.code(200).send({
        data: pending.map(toGdbDto),
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

  app.get('/api/gdbs/results', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const agg = await sdk.gdb.getAll();
      console.log(`[GDB-PERF] getResults: ${Date.now() - t0}ms`);

      const results = agg.gdbs.filter(g => g.status === 'result_declared');

      return reply.code(200).send({
        data: results.map(toGdbDto),
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
