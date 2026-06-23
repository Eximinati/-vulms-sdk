import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';
import { loadEnv } from '../config/env.js';

export default fp(async function jwtPlugin(app: FastifyInstance) {
  const env = loadEnv();
  app.register(fjwt, { secret: env.JWT_SECRET });
}, { name: 'jwt' });
