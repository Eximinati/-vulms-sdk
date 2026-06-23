import type { FastifyInstance } from 'fastify';
import { getAuthenticatedSdk, SessionMissingError, SessionInvalidError } from '../services/sdk-factory.js';
import { assignmentToActivity, quizToActivity, gdbToActivity, toActivitySummaryDto } from '../mappers/activity.js';
import type { ActivityDto, ActivityType } from '../types/activities.js';

interface ActivityQuery {
  type?: ActivityType;
  courseCode?: string;
  status?: string;
}

async function fetchAllActivities(sdk: Awaited<ReturnType<typeof getAuthenticatedSdk>>['sdk']): Promise<ActivityDto[]> {
  const [assignAgg, quizAgg, gdbAgg] = await Promise.all([
    sdk.assignments.getAll(),
    sdk.quizzes.getAll(),
    sdk.gdb.getAll(),
  ]);

  const activities: ActivityDto[] = [
    ...assignAgg.assignments.map(assignmentToActivity),
    ...quizAgg.quizzes.map(quizToActivity),
    ...gdbAgg.gdbs.map(gdbToActivity),
  ];

  return activities;
}

function filterActivities(activities: ActivityDto[], query: ActivityQuery): ActivityDto[] {
  let result = activities;

  if (query.type) {
    result = result.filter(a => a.type === query.type);
  }

  if (query.courseCode) {
    const code = query.courseCode.toUpperCase();
    result = result.filter(a => a.courseCode === code);
  }

  if (query.status) {
    result = result.filter(a => a.status === query.status);
  }

  return result;
}

export default async function activitiesRoutes(app: FastifyInstance) {
  app.get('/api/activities', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;
    const query = request.query as ActivityQuery;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const allActivities = await fetchAllActivities(sdk);
      const filtered = filterActivities(allActivities, query);
      console.log(`[ACTIVITY-PERF] getActivities: ${Date.now() - t0}ms (${allActivities.length} total, ${filtered.length} filtered)`);

      return reply.code(200).send({
        data: filtered,
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

  app.get('/api/activities/upcoming', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const allActivities = await fetchAllActivities(sdk);

      const now = new Date();
      const upcoming = allActivities
        .filter(a => {
          if (!a.dueDate) return false;
          const due = new Date(a.dueDate);
          return due > now && a.status !== 'submitted' && a.status !== 'result_declared';
        })
        .sort((a, b) => {
          const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return aTime - bTime;
        })
        .slice(0, 20);

      console.log(`[ACTIVITY-PERF] getUpcoming: ${Date.now() - t0}ms (${upcoming.length} upcoming)`);

      return reply.code(200).send({
        data: upcoming,
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

  app.get('/api/activities/pending', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const allActivities = await fetchAllActivities(sdk);

      const pending = allActivities.filter(a =>
        a.status === 'pending' || a.status === 'not_submitted' || a.status === 'open'
      );

      console.log(`[ACTIVITY-PERF] getPending: ${Date.now() - t0}ms (${pending.length} pending)`);

      return reply.code(200).send({
        data: pending,
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

  app.get('/api/activities/results', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const allActivities = await fetchAllActivities(sdk);

      const results = allActivities.filter(a =>
        a.status === 'result_declared' || a.status === 'submitted' || a.status === 'missed'
      );

      console.log(`[ACTIVITY-PERF] getResults: ${Date.now() - t0}ms (${results.length} results)`);

      return reply.code(200).send({
        data: results,
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

  app.get('/api/activities/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    try {
      const { sdk } = await getAuthenticatedSdk(studentId);
      const t0 = Date.now();
      const allActivities = await fetchAllActivities(sdk);

      const summary = {
        assignments: allActivities.filter(a => a.type === 'assignment').length,
        quizzes: allActivities.filter(a => a.type === 'quiz').length,
        gdbs: allActivities.filter(a => a.type === 'gdb').length,
      };

      console.log(`[ACTIVITY-PERF] getSummary: ${Date.now() - t0}ms`);

      return reply.code(200).send({
        summary: toActivitySummaryDto(summary),
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
