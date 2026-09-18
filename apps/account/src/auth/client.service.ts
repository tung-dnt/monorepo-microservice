import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClientModel, ClientSchema } from '../common/schema/account/index.js';
import { CreateClientDto, UpdateClientDto } from '../common/dto.js';

@Injectable()
export class ClientService {
  constructor(@InjectModel(ClientSchema) private readonly repo: ClientModel) {}

  // Get all clients
  async findAll(): Promise<ClientSchema[]> {
    return await this.repo.findAll();
  }

  // Get a single client by ID
  async findById(id: number): Promise<ClientSchema> {
    const client = await this.repo.findByPk(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  // Create a new client
  async create(payload: CreateClientDto): Promise<ClientSchema> {
    return this.repo.create({ ...payload });
  }

  // Update client details
  async update(id: number, payload: UpdateClientDto): Promise<ClientSchema> {
    const client = await this.findById(id);
    return client.update(payload);
  }

  // Delete a client
  async delete(id: number): Promise<void> {
    const client = await this.findById(id);
    await client.destroy();
  }
}
