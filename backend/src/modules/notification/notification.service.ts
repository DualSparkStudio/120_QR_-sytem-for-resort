import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private whatsappToken: string;
  private whatsappPhoneId: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.whatsappToken = this.configService.get('WHATSAPP_BUSINESS_TOKEN') || '';
    this.whatsappPhoneId = this.configService.get('WHATSAPP_PHONE_ID') || '';
  }

  // ============ WHATSAPP NOTIFICATIONS ============

  async sendWhatsAppNotification(phoneNumber: string, message: string, templateName?: string) {
    try {
      if (!this.whatsappToken || !this.whatsappPhoneId) {
        this.logger.warn('WhatsApp credentials not configured');
        return null;
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await axios.post(
        `https://graph.instagram.com/v18.0/${this.whatsappPhoneId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.whatsappToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`WhatsApp message sent to ${phoneNumber}`);
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send WhatsApp message: ${errorMessage}`);
      return null;
    }
  }

  // ============ EMAIL NOTIFICATIONS ============

  async sendEmailNotification(email: string, subject: string, body: string) {
    try {
      // Integrate with email service (SendGrid, AWS SES, etc.)
      this.logger.log(`Email notification queued for ${email}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${errorMessage}`);
      return null;
    }
  }

  // ============ PUSH NOTIFICATIONS ============

  async sendPushNotification(deviceToken: string, title: string, body: string) {
    try {
      // Integrate with Firebase Cloud Messaging
      this.logger.log(`Push notification queued for device ${deviceToken}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send push notification: ${errorMessage}`);
      return null;
    }
  }

  // ============ ORDER NOTIFICATIONS ============

  async notifyOrderStatus(orderId: string, status: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return null;
      }

      const messages: Record<string, string> = {
        confirmed: `Your order #${order.orderNumber} has been confirmed!`,
        preparing: `Your order #${order.orderNumber} is being prepared.`,
        ready: `Your order #${order.orderNumber} is ready for pickup!`,
        delivered: `Your order #${order.orderNumber} has been delivered.`,
        cancelled: `Your order #${order.orderNumber} has been cancelled.`,
      };

      const message = messages[status] || `Order status updated: ${status}`;

      if (order.guestPhone) {
        await this.sendWhatsAppNotification(order.guestPhone, message);
      }

      if (order.guestEmail) {
        await this.sendEmailNotification(order.guestEmail, 'Order Update', message);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to notify order status: ${errorMessage}`);
      return null;
    }
  }

  // ============ SERVICE REQUEST NOTIFICATIONS ============

  async notifyServiceRequestStatus(serviceRequestId: string, status: string) {
    try {
      const serviceRequest = await this.prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
        include: { room: true },
      });

      if (!serviceRequest) {
        return null;
      }

      const messages: Record<string, string> = {
        assigned: `Your ${serviceRequest.serviceType} request has been assigned.`,
        in_progress: `Your ${serviceRequest.serviceType} request is in progress.`,
        completed: `Your ${serviceRequest.serviceType} request has been completed.`,
      };

      const message = messages[status] || `Service request status updated: ${status}`;

      // Send to room phone if available
      this.logger.log(`Service request notification: ${message}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to notify service request status: ${errorMessage}`);
      return null;
    }
  }

  // ============ PAYMENT NOTIFICATIONS ============

  async notifyPaymentConfirmation(paymentId: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return null;
      }

      const message = `Payment of ${payment.currency} ${payment.amount} has been confirmed.`;

      this.logger.log(`Payment confirmation notification: ${message}`);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to notify payment confirmation: ${errorMessage}`);
      return null;
    }
  }
}
