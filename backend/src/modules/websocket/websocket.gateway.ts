import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

@NestWebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<string, Set<string>>();

  constructor(private redis: RedisService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join_resort')
  handleJoinResort(@MessageBody() data: { resortId: string }, @ConnectedSocket() client: Socket) {
    const room = `resort:${data.resortId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true };
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; resortId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room:${data.roomId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { success: true };
  }

  @SubscribeMessage('leave_resort')
  handleLeaveResort(@MessageBody() data: { resortId: string }, @ConnectedSocket() client: Socket) {
    const room = `resort:${data.resortId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { success: true };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room:${data.roomId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    return { success: true };
  }

  // Broadcast order update to resort
  broadcastOrderUpdate(resortId: string, data: any) {
    this.server.to(`resort:${resortId}`).emit('order_updated', data);
  }

  // Broadcast order update to specific room
  broadcastOrderUpdateToRoom(roomId: string, data: any) {
    this.server.to(`room:${roomId}`).emit('order_updated', data);
  }

  // Broadcast service request update
  broadcastServiceRequestUpdate(resortId: string, data: any) {
    this.server.to(`resort:${resortId}`).emit('service_request_updated', data);
  }

  // Broadcast payment update
  broadcastPaymentUpdate(resortId: string, data: any) {
    this.server.to(`resort:${resortId}`).emit('payment_updated', data);
  }

  // Broadcast kitchen display system update
  broadcastKDSUpdate(resortId: string, data: any) {
    this.server.to(`resort:${resortId}:kds`).emit('kds_update', data);
  }
}
