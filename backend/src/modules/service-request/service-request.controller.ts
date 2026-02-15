import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from './dto/service-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resorts/:resortId/service-requests')
export class ServiceRequestController {
  constructor(private serviceRequestService: ServiceRequestService) {}

  @Post('rooms/:roomId')
  async createServiceRequest(
    @Param('resortId') resortId: string,
    @Param('roomId') roomId: string,
    @Body() createDto: CreateServiceRequestDto,
  ) {
    return this.serviceRequestService.createServiceRequest(resortId, roomId, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findServiceRequestsByResort(
    @Param('resortId') resortId: string,
    @Query('status') status?: string,
    @Query('serviceType') serviceType?: string,
    @Query('priority') priority?: string,
  ) {
    return this.serviceRequestService.findServiceRequestsByResort(resortId, {
      status,
      serviceType,
      priority,
    });
  }

  @Get(':id')
  async findServiceRequestById(@Param('id') id: string) {
    return this.serviceRequestService.findServiceRequestById(id);
  }

  @Get('room/:roomId')
  async findServiceRequestsByRoom(@Param('roomId') roomId: string) {
    return this.serviceRequestService.findServiceRequestsByRoom(roomId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateServiceRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceRequestDto,
  ) {
    return this.serviceRequestService.updateServiceRequest(id, updateDto);
  }

  @Put(':id/assign')
  @UseGuards(JwtAuthGuard)
  async assignServiceRequest(@Param('id') id: string, @Body() body: { staffId: string }) {
    return this.serviceRequestService.assignServiceRequest(id, body.staffId);
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard)
  async completeServiceRequest(@Param('id') id: string) {
    return this.serviceRequestService.completeServiceRequest(id);
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  async getServiceRequestStats(@Param('resortId') resortId: string) {
    return this.serviceRequestService.getServiceRequestStats(resortId);
  }
}
