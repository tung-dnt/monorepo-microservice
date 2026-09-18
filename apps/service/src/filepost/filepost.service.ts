import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { Env } from '../common/env.js';
import { EnvService } from '@nhl/env';
import 'multer';

@Injectable()
export class FilePostService {
  constructor(private readonly env: EnvService<Env>) { }

  async upload(file: Express.Multer.File): Promise<string | undefined> {
    const filePost = this.env.get('filePost');

    if (!filePost) return undefined;

    const maxFileSize = filePost.maxFileSizeMb * 1024 * 1024;

    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size must not exceed ${filePost.maxFileSizeMb} MB`,
      );
    }

    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await axios.post(filePost.url, form, {
        headers: {
          ...form.getHeaders(),
          'X-API-Key': filePost.apiKey,
        },
        maxContentLength: maxFileSize,
        maxBodyLength: maxFileSize,
      });

      const url = response.data?.url;
      if (typeof url !== 'string' || url.length === 0) {
        throw new Error('FilePost response did not include a URL');
      }

      return url;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Contract upload failed');
    }
  }
}
