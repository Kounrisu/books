import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import sharp = require('sharp');
import { UPLOADS_DIR } from './multer.config.js';

const MAX_DIMENSION = 4000;

@Injectable()
export class UploadsService {
  /**
   * Decodes and re-encodes the uploaded bytes as webp. This is the real
   * content check — an attacker-controlled mimetype/extension can lie, but
   * sharp only produces output for bytes it can actually decode as an image,
   * and re-encoding strips anything (scripts, polyglot payloads, embedded
   * metadata) that rode along in the original file.
   */
  async saveImage(buffer: Buffer): Promise<string> {
    let processed: Buffer;
    try {
      processed = await sharp(buffer)
        .rotate()
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException('The uploaded file is not a valid image');
    }
    const filename = `${randomUUID()}.webp`;
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(join(UPLOADS_DIR, filename), processed);
    return filename;
  }

  async deleteFile(filename: string | null | undefined): Promise<void> {
    if (!filename) {
      return;
    }
    try {
      await fs.unlink(join(UPLOADS_DIR, filename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
