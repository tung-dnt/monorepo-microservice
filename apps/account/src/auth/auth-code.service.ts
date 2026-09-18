import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthCodeModel, AuthCodeSchema } from '../common/schema/account/index.js';
import { CreateAuthCodeDto } from '../common/dto.js';

@Injectable()
export class AuthCodeService {
  constructor(
    @InjectModel(AuthCodeSchema) private readonly repo: AuthCodeModel,
  ) {}

  // Get all auth codes (optional: for debugging/admin purposes)
  async findAll(): Promise<AuthCodeSchema[]> {
    return this.repo.findAll();
  }

  // Get a single auth code by ID
  async findById(id: number): Promise<AuthCodeSchema> {
    const authCode = await this.repo.findByPk(id);
    if (!authCode) {
      throw new NotFoundException(`Auth code with ID ${id} not found`);
    }
    return authCode;
  }

  async findOne(query: {
    accountId: number;
    codeType: string;
  }): Promise<AuthCodeSchema> {
    const authCode = await this.repo.findOne({
      where: { accountId: query.accountId, codeType: query.codeType },
      order: [['createdAt', 'DESC']],
    });
    if (!authCode) {
      throw new NotFoundException(`Auth code not found`);
    }
    return authCode;
  }

  // Create a new auth code
  async create(payload: CreateAuthCodeDto): Promise<AuthCodeSchema> {
    console.log('Payload', payload);

    return this.repo.create({ ...payload });
  }

  // Verify an auth code (check if it exists and is still valid)
  async verifyCode(code: number, accountId: number): Promise<boolean> {
    const authCode = await this.repo.findOne({ where: { code, accountId } });

    if (!authCode) return false;
    if (authCode.expiresAt < Date.now()) return false; // Code expired

    return true;
  }

  // Delete an auth code (e.g., after successful verification)
  async delete(id: number): Promise<void> {
    const authCode = await this.findById(id);
    await authCode.destroy();
  }

  generateAuthCode(): number {
    return Math.floor(Math.random() * 999) + 1;
  }
}
