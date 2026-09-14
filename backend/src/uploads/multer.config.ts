import { join } from 'node:path';
import { memoryStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');

export function imageFileFilter(
  _req: unknown,
  file: { mimetype: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  callback(null, file.mimetype.startsWith('image/'));
}

// Files are held in memory only. The mimetype filter here is just a cheap
// early rejection — the real validation is UploadsService#saveImage, which
// decodes the bytes with sharp and only writes to disk (with a generated
// filename) once ownership of the target record has been confirmed.
export const imageUploadOptions: MulterOptions = {
  storage: memoryStorage(),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
};
