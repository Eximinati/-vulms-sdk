import type { FastifyInstance } from 'fastify';
import { VulmsSDK } from 'vulms-sdk';
import { sessionStore } from '../services/session-store.js';

export default async function debugRoutes(app: FastifyInstance) {
  app.get('/api/debug/session', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    const stored = sessionStore.get(studentId);
    if (!stored) {
      return reply.code(404).send({
        valid: false,
        reason: 'No stored session for this studentId',
      });
    }

    const sdk = new VulmsSDK();
    await sdk.importSession(stored.exportedSession);
    const result = await sdk.validateImportedSession();

    return reply.code(200).send({
      studentId,
      storedAt: stored.createdAt,
      exportedAt: stored.exportedSession.exportedAt,
      sdkVersion: stored.exportedSession.sdkVersion,
      ...result,
    });
  });
}
