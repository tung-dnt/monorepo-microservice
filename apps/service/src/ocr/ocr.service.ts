import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Module,
} from '@nestjs/common';
import { Environment, EnvService } from '@nhl/env';
import { GoogleGenAI } from "@google/genai";
import { Env } from '../common/env.js';
import { parseObjectFromContent } from '../common/util.js';
import { IElectricMeterImageResponse } from '../common/interface.js';

@Injectable()
export class OcrService {
  private aiClient: GoogleGenAI;

  constructor(private readonly env: EnvService<Env>) {
    this.aiClient = new GoogleGenAI({
      apiKey: this.env.get('ai.apiKey'),
    });
  }

  encodeImage = (fileBuffer: Buffer) => {
    return Buffer.from(fileBuffer).toString('base64');
  };

  extractContentWithAi = async (base64Image: string): Promise<IElectricMeterImageResponse> => {
    try {
      const promt = 'Extract all the relevant details from this image into object like this interface' +
        '{ ' +
        ' electricMeterReading: string' +
        ' manufacturer: string' +
        ' model: string' +
        ' serialNumber: string' +
        ' voltage: string' +
        ' current: string' +
        ' frequency: string' +
        ' powerFactor: string' +
        ' temperature: string' +
        ' phase: string' +
        ' installationYear: string' +
        ' locationMarking: string' +
        '}'

      const response = await this.aiClient.interactions.create({
        input: [
          {
            type: 'text',
            text: promt
          },
          {
            type: 'image',
            data: base64Image,
            mime_type: "image/jpeg"
          },
        ],
        model: this.env.get('ai.model'),
        response_format: {
          type: 'text',
          mime_type: 'application/json',
        },
        generation_config: {
          thinking_level: "low"
        },
      });

      console.log(response.output_text)

      const content = parseObjectFromContent(
        response.output_text.replace('`', '').replace('json', ''),
      ) as IElectricMeterImageResponse;

      return content;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  processMeterImage = async (
    file: Express.Multer.File,
  ): Promise<IElectricMeterImageResponse | null> => {
    console.log('env', this.env.get('env'));

    if (this.env.get('env') == Environment.Development)
      return {
        electricMeterReading: '100',
        manufacturer: '100',
        model: '100',
        serialNumber: '100',
        voltage: '100',
        current: '100',
        frequency: '100',
        powerFactor: '100',
        temperature: '100',
        phase: '100',
        installationYear: '100',
        locationMarking: '100',
      };

    if (!file) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'No file provided',
      });
    }

    const base64Image = this.encodeImage(file[0].buffer); // Directly use file.buffer

    const extractedContent = await this.extractContentWithAi(base64Image)

    return extractedContent || null
  };
}
