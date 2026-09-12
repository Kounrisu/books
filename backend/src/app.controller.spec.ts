import { describe, it, expect } from 'vitest';
import { AppController } from './app.controller.js';

describe('AppController', () => {
  it('returns ok status from health check', () => {
    const controller = new AppController();
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});
