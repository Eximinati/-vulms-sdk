import type { FastifyInstance } from 'fastify';
import { getAuthenticatedSdk, SessionMissingError, SessionInvalidError } from '../services/sdk-factory.js';
import { toQuizDto, toQuizSummaryDto } from '../mappers/quiz.js';

export default async function quizzesRoutes(app: FastifyInstance) {
  app.get('/api/quizzes', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;
    const { courseCode } = request.query as { courseCode?: string };

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const quizzes = await sdk.quizzes.getQuizzes(courseCode);
      console.log(`[QUIZ-PERF] getQuizzes: ${Date.now() - t0}ms`);

      return reply.code(200).send({
        data: quizzes.map(toQuizDto),
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

  app.get('/api/quizzes/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const summary = await sdk.quizzes.getSummary();
      console.log(`[QUIZ-PERF] getSummary: ${Date.now() - t0}ms`);

      return reply.code(200).send({
        summary: toQuizSummaryDto(summary),
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

  app.get('/api/quizzes/upcoming', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const agg = await sdk.quizzes.getAll();
      console.log(`[QUIZ-PERF] getUpcoming: ${Date.now() - t0}ms`);

      const upcoming = agg.quizzes
        .filter(q => q.availabilityStatus === 'upcoming')
        .sort((a, b) => {
          const aTime = a.startDate instanceof Date ? a.startDate.getTime() : 0;
          const bTime = b.startDate instanceof Date ? b.startDate.getTime() : 0;
          return aTime - bTime;
        });

      return reply.code(200).send({
        data: upcoming.map(toQuizDto),
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

  app.get('/api/quizzes/open', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const agg = await sdk.quizzes.getAll();
      console.log(`[QUIZ-PERF] getOpen: ${Date.now() - t0}ms`);

      const open = agg.quizzes.filter(q => q.availabilityStatus === 'open');

      return reply.code(200).send({
        data: open.map(toQuizDto),
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

  app.get('/api/quizzes/results', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const agg = await sdk.quizzes.getAll();
      console.log(`[QUIZ-PERF] getResults: ${Date.now() - t0}ms`);

      const results = agg.quizzes.filter(q => q.resultStatus === 'declared');

      return reply.code(200).send({
        data: results.map(toQuizDto),
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
