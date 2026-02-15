import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpayKey: string;
  private razorpaySecret: string;
  private stripeKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    this.razorpayKey = this.configService.get('RAZORPAY_KEY_ID') || '';
    this.razorpaySecret = this.configService.get('RAZORPAY_KEY_SECRET') || '';
    this.stripeKey = this.configService.get('STRIPE_SECRET_KEY') || '';
  }

  // ============ RAZORPAY INTEGRATION ============

  async createRazorpayOrder(orderId: string, amount: number, currency: string = 'INR') {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const razorpayOrderData = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: order.orderNumber,
        notes: {
          orderId,
          roomId: order.roomId,
        },
      };

      const response = await axios.post('https://api.razorpay.com/v1/orders', razorpayOrderData, {
        auth: {
          username: this.razorpayKey,
          password: this.razorpaySecret,
        },
      });

      const payment = await this.prisma.payment.create({
        data: {
          resortId: order.resortId,
          amount,
          currency,
          paymentMethod: 'razorpay',
          razorpayOrderId: response.data.id,
          status: 'pending',
          metadata: JSON.stringify(response.data),
        },
      });

      // Link payment to order
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentId: payment.id },
      });

      return {
        paymentId: payment.id,
        razorpayOrderId: response.data.id,
        amount,
        currency,
        key: this.razorpayKey,
      };
    } catch (error) {
      this.logger.error('Razorpay order creation failed:', error);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyRazorpayPayment(paymentData: any) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      // Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpaySecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new BadRequestException('Invalid payment signature');
      }

      // Fetch payment details from Razorpay
      const response = await axios.get(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          auth: {
            username: this.razorpayKey,
            password: this.razorpaySecret,
          },
        },
      );

      // Update payment record
      const payment = await this.prisma.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!payment) {
        throw new NotFoundException('Payment record not found');
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: response.data.status === 'captured' ? 'completed' : 'failed',
          completedAt: response.data.status === 'captured' ? new Date() : null,
          metadata: JSON.stringify(response.data),
        },
      });

      // Update order payment status
      if (updatedPayment.status === 'completed') {
        const order = await this.prisma.order.findFirst({
          where: { paymentId: payment.id },
        });

        if (order) {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: 'completed' },
          });

          // Publish payment confirmation event
          await this.redis.publish(`resort:${order.resortId}:payments`, {
            event: 'payment_completed',
            orderId: order.id,
            paymentId: payment.id,
            amount: updatedPayment.amount,
            timestamp: new Date(),
          });
        }
      }

      this.logger.log(`Razorpay payment verified: ${razorpay_payment_id}`);

      return updatedPayment;
    } catch (error) {
      this.logger.error('Razorpay payment verification failed:', error);
      throw new BadRequestException('Payment verification failed');
    }
  }

  // ============ STRIPE INTEGRATION ============

  async createStripePaymentIntent(orderId: string, amount: number, currency: string = 'inr') {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const response = await axios.post(
        'https://api.stripe.com/v1/payment_intents',
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: {
            orderId,
            roomId: order.roomId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.stripeKey}`,
          },
        },
      );

      const payment = await this.prisma.payment.create({
        data: {
          resortId: order.resortId,
          amount,
          currency,
          paymentMethod: 'stripe',
          stripePaymentIntentId: response.data.id,
          status: 'pending',
          metadata: JSON.stringify(response.data),
        },
      });

      // Link payment to order
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentId: payment.id },
      });

      return {
        paymentId: payment.id,
        clientSecret: response.data.client_secret,
        amount,
        currency,
      };
    } catch (error) {
      this.logger.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  // ============ REFUND MANAGEMENT ============

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new BadRequestException('Only completed payments can be refunded');
      }

      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount) {
        throw new BadRequestException('Refund amount exceeds payment amount');
      }

      let refundResponse;

      if (payment.paymentMethod === 'razorpay' && payment.razorpayPaymentId) {
        refundResponse = await axios.post(
          `https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}/refund`,
          {
            amount: Math.round(refundAmount * 100),
            notes: {
              reason: reason || 'Customer requested refund',
            },
          },
          {
            auth: {
              username: this.razorpayKey,
              password: this.razorpaySecret,
            },
          },
        );
      } else if (payment.paymentMethod === 'stripe' && payment.stripePaymentIntentId) {
        refundResponse = await axios.post(
          'https://api.stripe.com/v1/refunds',
          {
            payment_intent: payment.stripePaymentIntentId,
            amount: Math.round(refundAmount * 100),
            reason: reason || 'requested_by_customer',
          },
          {
            headers: {
              Authorization: `Bearer ${this.stripeKey}`,
            },
          },
        );
      } else {
        throw new BadRequestException('Unsupported payment method for refund');
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          refundAmount: (payment.refundAmount || 0) + refundAmount,
          refundStatus: 'completed',
          refundReason: reason,
        },
      });

      this.logger.log(`Refund processed: ${paymentId}, Amount: ${refundAmount}`);

      return updatedPayment;
    } catch (error) {
      this.logger.error('Refund processing failed:', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  // ============ PAYMENT QUERIES ============

  async findPaymentById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findPaymentsByResort(resortId: string, filters?: any) {
    const where: any = { resortId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPaymentStats(resortId: string) {
    const [totalPayments, completedPayments, totalRevenue, refundedAmount] = await Promise.all([
      this.prisma.payment.count({ where: { resortId } }),
      this.prisma.payment.count({ where: { resortId, status: 'completed' } }),
      this.prisma.payment.aggregate({
        where: { resortId, status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { resortId, refundStatus: 'completed' },
        _sum: { refundAmount: true },
      }),
    ]);

    return {
      totalPayments,
      completedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      refundedAmount: refundedAmount._sum.refundAmount || 0,
    };
  }
}
