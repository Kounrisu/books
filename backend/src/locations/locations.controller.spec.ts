import { describe, it, expect, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { LocationsController } from './locations.controller.js';
import type { LocationsService } from './locations.service.js';

function makeServiceMock() {
  return {
    create: vi.fn().mockResolvedValue(null),
    findAllForUser: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
  } as unknown as LocationsService;
}

describe('LocationsController', () => {
  it('rejects a create with a non-numeric latitude', () => {
    const service = makeServiceMock();
    const controller = new LocationsController(service);

    expect(() =>
      controller.create('user-1', { name: 'Shelf', latitude: 'abc' }),
    ).toThrow(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('rejects a create with a non-numeric longitude', () => {
    const service = makeServiceMock();
    const controller = new LocationsController(service);

    expect(() =>
      controller.create('user-1', { name: 'Shelf', longitude: 'abc' }),
    ).toThrow(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('rejects an update with a non-numeric latitude', () => {
    const service = makeServiceMock();
    const controller = new LocationsController(service);

    expect(() =>
      controller.update('user-1', 'location-1', { latitude: 'not-a-number' }),
    ).toThrow(BadRequestException);
    expect(service.update).not.toHaveBeenCalled();
  });

  it('accepts a valid numeric latitude/longitude', () => {
    const service = makeServiceMock();
    const controller = new LocationsController(service);

    controller.create('user-1', { name: 'Shelf', latitude: '1.5', longitude: '-2.5' });

    expect(service.create).toHaveBeenCalledWith('user-1', {
      name: 'Shelf',
      photoPath: undefined,
      latitude: 1.5,
      longitude: -2.5,
    });
  });

  it('treats an empty coordinate as unset rather than NaN', () => {
    const service = makeServiceMock();
    const controller = new LocationsController(service);

    controller.create('user-1', { name: 'Shelf', latitude: '' });

    expect(service.create).toHaveBeenCalledWith('user-1', {
      name: 'Shelf',
      photoPath: undefined,
      latitude: undefined,
      longitude: undefined,
    });
  });
});
