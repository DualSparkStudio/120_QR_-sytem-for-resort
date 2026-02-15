import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // ============ RAZORPAY ENDPOINTS ============

  @Post('razorpay/create-order')
  async createRazorpayOrder(@Body() body: { orderId: string; amount: number; currency?: string }) {
    return this.paymentService.createRazorpayOrder(body.orderId, body.amount, body.currency);
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(@Body() paymentData: any) {
    return this.paymentService.verifyRazorpayPayment(paymentData);
  }

  // ============ STRIPE ENDPOINTS ============

  @Post('stripe/create-intent')
  async createStripePaymentIntent(@Body() body: { orderId: string; amount: number; currency?: string }) {
    return this.paymentService.createStripePaymentIntent(body.orderId, body.amount, body.currency);
  }

  // ============ REFUND ENDPOINTS ============

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  async refundPayment(
    @Param('id') id: string,
    @Body() body: { amount?: number; reason?: string },
  ) {
    return this.paymentService.refundPayment(id, body.amount, body.reason);
  }

  // ============ QUERY ENDPOINTS ============

  @Get(':id')
  async findPaymentById(@Param('id') id: string) {
    return this.paymentService.findPaymentById(id);
  }

  @Get('resort/:resortId')
  @UseGuards(JwtAuthGuard)
  async findPaymentsByResort(
    @Param('resortId') resortId: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.paymentService.findPaymentsByResort(resortId, { status, paymentMethod });
  }

  @Get('resort/:resortId/stats')
  @UseGuards(JwtAuthGuard)
  async getPaymentStats(@Param('resortId') resortId: string) {
    return this.paymentService.getPaymentStats(resortId);
  }
}
