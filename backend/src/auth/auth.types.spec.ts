import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginInput, RegisterInput } from './auth.types.js';

describe('RegisterInput / LoginInput validation', () => {
  it('accepts a valid email and an 8+ character password', async () => {
    const input = plainToInstance(RegisterInput, {
      email: 'a@b.com',
      password: 'password123',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const input = plainToInstance(LoginInput, {
      email: 'not-an-email',
      password: 'password123',
    });

    const errors = await validate(input);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const input = plainToInstance(LoginInput, {
      email: 'a@b.com',
      password: 'short',
    });

    const errors = await validate(input);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
