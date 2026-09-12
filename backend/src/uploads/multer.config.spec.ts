import { describe, it, expect } from 'vitest';
import { imageFileFilter, generateUploadFilename } from './multer.config.js';

describe('generateUploadFilename', () => {
  it('preserves the original file extension', () => {
    const filename = generateUploadFilename('cover.JPG');
    expect(filename).toMatch(/\.jpg$/);
  });

  it('generates a different name each call', () => {
    expect(generateUploadFilename('a.png')).not.toBe(generateUploadFilename('a.png'));
  });
});

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
