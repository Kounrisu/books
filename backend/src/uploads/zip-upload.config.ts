import { memoryStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';

export const zipUploadOptions: MulterOptions = {
  storage: memoryStorage(),
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype === 'application/zip' || file.originalname.endsWith('.zip'));
  },
  limits: { fileSize: 500 * 1024 * 1024 },
};
