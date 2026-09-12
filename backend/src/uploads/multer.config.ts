import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

export function generateUploadFilename(originalName: string): string {
  const ext = extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}

export function imageFileFilter(
  _req: unknown,
  file: { mimetype: string },
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  callback(null, file.mimetype.startsWith('image/'));
}

export const imageUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => callback(null, generateUploadFilename(file.originalname)),
  }),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
};
