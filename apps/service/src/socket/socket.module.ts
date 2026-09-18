import { Module } from '@nestjs/common';
import { ServiceWebSocket } from './socket.adapter.js';

@Module({
  providers: [ServiceWebSocket],
})
export class SocketModule {}
