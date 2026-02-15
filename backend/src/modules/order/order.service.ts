import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createOrder(resortId: string, roomId: string, createOrderDto: CreateOrderDto) {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || room.resortId !== resortId) {
      throw new NotFoundException('Room not found');
    }

    // Verify resort exists
    const resort = await this.prisma.resort.findUnique({
      where: { id: resortId },
    });

    if (!resort) {
      throw new NotFoundException('Resort not found');
    }

    // Verify menu items exist
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: createOrderDto.items.map((item) => item.menuItemId) },
        resortId,
      },
    });

    if (menuItems.length !== createOrderDto.items.length) {
      throw new BadRequestException('Some menu items not found');
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of createOrderDto.items) {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }
      const itemTotal = menuItem.basePrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.basePrice,
        selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null,
        specialInstructions: item.specialInstructions,
      });
    }

    const taxAmount = (subtotal * resort.taxPercentage) / 100;
    const serviceCharge = (subtotal * resort.serviceChargePercentage) / 100;
    const totalAmount = subtotal + taxAmount + serviceCharge - (createOrderDto.discountAmount || 0);

    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const order = await this.prisma.order.create({
      data: {
        resortId,
        roomId,
        orderNumber,
        guestName: createOrderDto.guestName,
        guestPhone: createOrderDto.guestPhone,
        guestEmail: createOrderDto.guestEmail,
        specialInstructions: createOrderDto.specialInstructions,
        subtotal,
        taxAmount,
        serviceCharge,
        discountAmount: createOrderDto.discountAmount || 0,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    // Cache order for real-time updates
    await this.redis.set(`order:${order.id}`, order, 86400); // 24 hours

    // Publish order creation event
    await this.redis.publish(`resort:${resortId}:orders`, {
      event: 'order_created',
      orderId: order.id,
      roomId,
      timestamp: new Date(),
    });

    this.logger.log(`Order created: ${order.orderNumber}`);

    return order;
  }

  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findOrdersByRoom(roomId: string) {
    return this.prisma.order.findMany({
      where: { roomId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrdersByResort(resortId: string, filters?: any) {
    const where: any = { resortId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menuItem: true },
        },
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOrderById(id);

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(updateStatusDto.status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        completedAt: updateStatusDto.status === 'delivered' ? new Date() : null,
        cancelledAt: updateStatusDto.status === 'cancelled' ? new Date() : null,
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    // Update cache
    await this.redis.set(`order:${id}`, updatedOrder, 86400);

    // Publish status update event
    await this.redis.publish(`resort:${order.resortId}:orders`, {
      event: 'order_status_updated',
      orderId: id,
      status: updateStatusDto.status,
      timestamp: new Date(),
    });

    this.logger.log(`Order ${id} status updated to ${updateStatusDto.status}`);

    return updatedOrder;
  }

  async cancelOrder(id: string, reason?: string) {
    const order = await this.findOrderById(id);

    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel this order');
    }

    return this.updateOrderStatus(id, { status: 'cancelled' });
  }

  async getOrderStats(resortId: string) {
    const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where: { resortId } }),
      this.prisma.order.count({ where: { resortId, status: 'pending' } }),
      this.prisma.order.count({ where: { resortId, status: 'delivered' } }),
      this.prisma.order.aggregate({
        where: { resortId, status: 'delivered' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}
