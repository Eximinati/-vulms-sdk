import { describe, it, expect } from 'vitest';
import { PostBackEngine } from '../../src/client/postback-engine';
import { HttpClient } from '../../src/client/http-client';

describe('PostBackEngine', () => {
  it('should create instance with HttpClient', () => {
    const client = new HttpClient();
    const engine = new PostBackEngine(client);
    expect(engine).toBeInstanceOf(PostBackEngine);
    expect(engine.hasState()).toBe(false);
  });

  it('should clear state', () => {
    const client = new HttpClient();
    const engine = new PostBackEngine(client);
    engine.clearState();
    expect(engine.hasState()).toBe(false);
  });
});
