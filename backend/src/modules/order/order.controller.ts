import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resorts/:resortId/orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('rooms/:roomId')
  async createOrder(
    @Param('resortId') resortId: string,
    @Param('roomId') roomId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(resortId, roomId, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOrdersByResort(
    @Param('resortId') resortId: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.findOrdersByResort(resortId, {
      status,
      paymentStatus,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  async findOrderById(@Param('id') id: string) {
    return this.orderService.findOrderById(id);
  }

  @Get('room/:roomId')
  async findOrdersByRoom(@Param('roomId') roomId: string) {
    return this.orderService.findOrdersByRoom(roomId);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(id, updateStatusDto);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.orderService.cancelOrder(id, body?.reason);
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  async getOrderStats(@Param('resortId') resortId: string) {
    return this.orderService.getOrderStats(resortId);
  }
}
