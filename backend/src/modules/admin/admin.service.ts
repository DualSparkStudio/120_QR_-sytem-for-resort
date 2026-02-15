import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  // ============ STAFF MANAGEMENT ============

  async createStaff(resortId: string, staffData: any) {
    const resort = await this.prisma.resort.findUnique({
      where: { id: resortId },
    });

    if (!resort) {
      throw new NotFoundException('Resort not found');
    }

    const existingStaff = await this.prisma.staff.findFirst({
      where: {
        resortId,
        email: staffData.email,
      },
    });

    if (existingStaff) {
      throw new BadRequestException('Staff with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(staffData.password, 10);

    const staff = await this.prisma.staff.create({
      data: {
        resortId,
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        role: staffData.role,
        passwordHash: hashedPassword,
      },
    });

    // Remove password from response
    const { passwordHash, ...staffWithoutPassword } = staff;
    return staffWithoutPassword;
  }

  async findAllStaff(resortId: string) {
    return this.prisma.staff.findMany({
      where: { resortId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async findStaffById(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        resortId: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async updateStaff(id: string, updateData: any) {
    await this.findStaffById(id);

    const staff = await this.prisma.staff.update({
      where: { id },
      data: {
        name: updateData.name,
        phone: updateData.phone,
        role: updateData.role,
        isActive: updateData.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return staff;
  }

  async deleteStaff(id: string) {
    await this.findStaffById(id);
    return this.prisma.staff.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ============ DASHBOARD ANALYTICS ============

  async getDashboardStats(resortId: string) {
    const [
      totalRooms,
      occupiedRooms,
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalServiceRequests,
      pendingServiceRequests,
    ] = await Promise.all([
      this.prisma.room.count({ where: { resortId, deletedAt: null } }),
      this.prisma.room.count({ where: { resortId, status: 'occupied', deletedAt: null } }),
      this.prisma.order.count({ where: { resortId } }),
      this.prisma.order.count({ where: { resortId, status: 'pending' } }),
      this.prisma.payment.aggregate({
        where: { resortId, status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.serviceRequest.count({ where: { resortId } }),
      this.prisma.serviceRequest.count({ where: { resortId, status: 'pending' } }),
    ]);

    return {
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
      },
      revenue: totalRevenue._sum.amount || 0,
      serviceRequests: {
        total: totalServiceRequests,
        pending: pendingServiceRequests,
      },
    };
  }

  async getRevenueStats(resortId: string, startDate?: Date, endDate?: Date) {
    const where: any = { resortId, status: 'completed' };

    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = startDate;
      if (endDate) where.completedAt.lte = endDate;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      select: { amount: true, createdAt: true, paymentMethod: true },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod = {};

    payments.forEach((p) => {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
    });

    return {
      totalRevenue,
      byPaymentMethod: byMethod,
      transactionCount: payments.length,
    };
  }

  async getOrderAnalytics(resortId: string, startDate?: Date, endDate?: Date) {
    const where: any = { resortId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: true },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const averageOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      averageOrderValue,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };
  }
}
