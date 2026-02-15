import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ============ STAFF MANAGEMENT ============

  @Post('resorts/:resortId/staff')
  async createStaff(@Param('resortId') resortId: string, @Body() staffData: any) {
    return this.adminService.createStaff(resortId, staffData);
  }

  @Get('resorts/:resortId/staff')
  async findAllStaff(@Param('resortId') resortId: string) {
    return this.adminService.findAllStaff(resortId);
  }

  @Get('staff/:id')
  async findStaffById(@Param('id') id: string) {
    return this.adminService.findStaffById(id);
  }

  @Put('staff/:id')
  async updateStaff(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateStaff(id, updateData);
  }

  @Delete('staff/:id')
  async deleteStaff(@Param('id') id: string) {
    return this.adminService.deleteStaff(id);
  }

  // ============ ANALYTICS ============

  @Get('resorts/:resortId/dashboard')
  async getDashboardStats(@Param('resortId') resortId: string) {
    return this.adminService.getDashboardStats(resortId);
  }

  @Get('resorts/:resortId/revenue')
  async getRevenueStats(
    @Param('resortId') resortId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenueStats(
      resortId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('resorts/:resortId/orders-analytics')
  async getOrderAnalytics(
    @Param('resortId') resortId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getOrderAnalytics(
      resortId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
