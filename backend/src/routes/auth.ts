import type { FastifyInstance } from 'fastify';
import { VulmsSDK } from 'vulms-sdk';
import { LoginRequestSchema } from '../schemas/auth.js';
import { sessionStore } from '../services/session-store.js';
import type { StoredUserSession } from '../types/auth.js';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login', async (request, reply) => {
    const parsed = LoginRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: parsed.error.issues[0].message,
      });
    }

    const { studentId, password } = parsed.data;

    const sdk = new VulmsSDK();
    const result = await sdk.loginWithBrowser(studentId, password);

    if (!result.success) {
      return reply.code(401).send({
        error: 'Authentication Failed',
        message: result.error || 'Invalid credentials',
      });
    }

    const exportedSession = sdk.exportSession();

    const stored: StoredUserSession = {
      studentId,
      exportedSession,
      createdAt: Date.now(),
    };
    sessionStore.set(studentId, stored);

    const token = app.jwt.sign({ sub: studentId });

    return reply.code(200).send({
      success: true,
      token,
      studentId,
    });
  });

  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    const stored = sessionStore.get(studentId);
    if (!stored) {
      return reply.code(401).send({
        error: 'Session Not Found',
        message: 'Session expired or not found. Please login again.',
      });
    }

    return reply.code(200).send({
      studentId,
      authenticated: true,
    });
  });

  app.post('/api/auth/logout', { preHandler: [app.authenticate] }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const studentId = payload.sub;

    sessionStore.delete(studentId);

    return reply.code(200).send({ success: true });
  });
}
