import { describe, it, expect } from 'vitest';
import { imageFileFilter } from './multer.config.js';

describe('imageFileFilter', () => {
  it('accepts image mimetypes', () => {
    let accepted: boolean | undefined;
    imageFileFilter({} as never, { mimetype: 'image/jpeg' } as never, (_err, ok) => {
      accepted = ok;
    });
    expect(accepted).toBe(true);
  });

  it('rejects non-image mimetypes', () => {
    let accepted: boolean | undefined;
    imageFileFilter({} as never, { mimetype: 'application/pdf' } as never, (_err, ok) => {
      accepted = ok;
    });
    expect(accepted).toBe(false);
  });
});
