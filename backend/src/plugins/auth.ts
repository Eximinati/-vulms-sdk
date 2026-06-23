import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized', message: 'Missing or invalid token' });
  }
}

export default fp(async function authPlugin(app: FastifyInstance) {
  app.decorate('authenticate', authenticate);
}, { name: 'auth' });

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}
