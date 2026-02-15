import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private prisma: PrismaService) {}

  async generateOrderReport(resortId: string, startDate?: Date, endDate?: Date) {
    const where: any = { resortId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        room: true,
      },
    });

    return {
      reportType: 'Orders',
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalOrders: orders.length,
      data: orders,
    };
  }

  async generateRevenueReport(resortId: string, startDate?: Date, endDate?: Date) {
    const where: any = { resortId, status: 'completed' };

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = startDate;
      if (endDate) where.completedAt.lte = endDate;
    }

    const payments = await this.prisma.payment.findMany({
      where,
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod: Record<string, number> = {};

    payments.forEach((p) => {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
    });

    return {
      reportType: 'Revenue',
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalRevenue,
      byPaymentMethod: byMethod,
      data: payments,
    };
  }

  async generateServiceRequestReport(resortId: string, startDate?: Date, endDate?: Date) {
    const where: any = { resortId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const serviceRequests = await this.prisma.serviceRequest.findMany({
      where,
      include: { room: true, assignedStaff: true },
    });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    serviceRequests.forEach((sr) => {
      byType[sr.serviceType] = (byType[sr.serviceType] || 0) + 1;
      byStatus[sr.status] = (byStatus[sr.status] || 0) + 1;
    });

    return {
      reportType: 'Service Requests',
      generatedAt: new Date(),
      period: { startDate, endDate },
      totalRequests: serviceRequests.length,
      byType,
      byStatus,
      data: serviceRequests,
    };
  }

  async generateOccupancyReport(resortId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { resortId, deletedAt: null },
    });

    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
    const availableRooms = rooms.filter((r) => r.status === 'available').length;

    return {
      reportType: 'Occupancy',
      generatedAt: new Date(),
      totalRooms: rooms.length,
      occupied: occupiedRooms,
      maintenance: maintenanceRooms,
      available: availableRooms,
      occupancyRate: rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0,
    };
  }

  convertToCSV(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(',');
    const csvRows = data.map((row) => headers.map((header) => row[header] || '').join(','));
    return [csvHeaders, ...csvRows].join('\n');
  }
}
