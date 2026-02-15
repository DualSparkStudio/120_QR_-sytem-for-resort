import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from './dto/service-request.dto';

@Injectable()
export class ServiceRequestService {
  private readonly logger = new Logger(ServiceRequestService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createServiceRequest(resortId: string, roomId: string, createDto: CreateServiceRequestDto) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || room.resortId !== resortId) {
      throw new NotFoundException('Room not found');
    }

    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        resortId,
        roomId,
        serviceType: createDto.serviceType,
        description: createDto.description,
        priority: createDto.priority || 'normal',
        requestedTime: createDto.requestedTime ? new Date(createDto.requestedTime) : null,
      },
    });

    // Cache service request
    await this.redis.set(`service-request:${serviceRequest.id}`, serviceRequest, 86400);

    // Publish event
    await this.redis.publish(`resort:${resortId}:service-requests`, {
      event: 'service_request_created',
      serviceRequestId: serviceRequest.id,
      serviceType: serviceRequest.serviceType,
      priority: serviceRequest.priority,
      timestamp: new Date(),
    });

    this.logger.log(`Service request created: ${serviceRequest.id}`);

    return serviceRequest;
  }

  async findServiceRequestById(id: string) {
    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        room: true,
        assignedStaff: true,
      },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    return serviceRequest;
  }

  async findServiceRequestsByRoom(roomId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { roomId },
      include: {
        assignedStaff: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findServiceRequestsByResort(resortId: string, filters?: any) {
    const where: any = { resortId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.serviceType) {
      where.serviceType = filters.serviceType;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    return this.prisma.serviceRequest.findMany({
      where,
      include: {
        room: true,
        assignedStaff: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateServiceRequest(id: string, updateDto: UpdateServiceRequestDto) {
    await this.findServiceRequestById(id);

    const serviceRequest = await this.prisma.serviceRequest.update({
      where: { id },
      data: updateDto,
      include: {
        room: true,
        assignedStaff: true,
      },
    });

    // Update cache
    await this.redis.set(`service-request:${id}`, serviceRequest, 86400);

    // Publish update event
    await this.redis.publish(`resort:${serviceRequest.resortId}:service-requests`, {
      event: 'service_request_updated',
      serviceRequestId: id,
      status: serviceRequest.status,
      timestamp: new Date(),
    });

    this.logger.log(`Service request ${id} updated`);

    return serviceRequest;
  }

  async assignServiceRequest(id: string, staffId: string) {
    const serviceRequest = await this.findServiceRequestById(id);

    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff || staff.resortId !== serviceRequest.resortId) {
      throw new NotFoundException('Staff not found');
    }

    return this.updateServiceRequest(id, {
      assignedStaffId: staffId,
      status: 'assigned',
    });
  }

  async completeServiceRequest(id: string) {
    return this.updateServiceRequest(id, {
      status: 'completed',
      completedTime: new Date().toISOString(),
    });
  }

  async getServiceRequestStats(resortId: string) {
    const [totalRequests, pendingRequests, completedRequests] = await Promise.all([
      this.prisma.serviceRequest.count({ where: { resortId } }),
      this.prisma.serviceRequest.count({ where: { resortId, status: 'pending' } }),
      this.prisma.serviceRequest.count({ where: { resortId, status: 'completed' } }),
    ]);

    return {
      totalRequests,
      pendingRequests,
      completedRequests,
    };
  }
}
