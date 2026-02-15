import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('resorts/:resortId/orders')
  async generateOrderReport(
    @Param('resortId') resortId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    const report = await this.reportService.generateOrderReport(
      resortId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (format === 'csv' && res) {
      const csv = this.reportService.convertToCSV(report.data, [
        'orderNumber',
        'roomId',
        'totalAmount',
        'status',
        'createdAt',
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orders-report.csv"');
      res.send(csv);
    } else {
      return report;
    }
  }

  @Get('resorts/:resortId/revenue')
  async generateRevenueReport(
    @Param('resortId') resortId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    const report = await this.reportService.generateRevenueReport(
      resortId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (format === 'csv' && res) {
      const csv = this.reportService.convertToCSV(report.data, [
        'id',
        'amount',
        'paymentMethod',
        'status',
        'createdAt',
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
      res.send(csv);
    } else {
      return report;
    }
  }

  @Get('resorts/:resortId/service-requests')
  async generateServiceRequestReport(
    @Param('resortId') resortId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: string = 'json',
    @Res() res?: Response,
  ) {
    const report = await this.reportService.generateServiceRequestReport(
      resortId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    if (format === 'csv' && res) {
      const csv = this.reportService.convertToCSV(report.data, [
        'id',
        'serviceType',
        'status',
        'priority',
        'createdAt',
      ]);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="service-requests-report.csv"');
      res.send(csv);
    } else {
      return report;
    }
  }

  @Get('resorts/:resortId/occupancy')
  async generateOccupancyReport(@Param('resortId') resortId: string) {
    return this.reportService.generateOccupancyReport(resortId);
  }
}
