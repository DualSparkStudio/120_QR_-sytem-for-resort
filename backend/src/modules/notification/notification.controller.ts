import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('whatsapp')
  @UseGuards(JwtAuthGuard)
  async sendWhatsAppNotification(
    @Body() body: { phoneNumber: string; message: string; templateName?: string },
  ) {
    return this.notificationService.sendWhatsAppNotification(
      body.phoneNumber,
      body.message,
      body.templateName,
    );
  }

  @Post('email')
  @UseGuards(JwtAuthGuard)
  async sendEmailNotification(@Body() body: { email: string; subject: string; body: string }) {
    return this.notificationService.sendEmailNotification(body.email, body.subject, body.body);
  }

  @Post('push')
  @UseGuards(JwtAuthGuard)
  async sendPushNotification(
    @Body() body: { deviceToken: string; title: string; body: string },
  ) {
    return this.notificationService.sendPushNotification(body.deviceToken, body.title, body.body);
  }

  @Post('order-status')
  @UseGuards(JwtAuthGuard)
  async notifyOrderStatus(@Body() body: { orderId: string; status: string }) {
    return this.notificationService.notifyOrderStatus(body.orderId, body.status);
  }

  @Post('service-request-status')
  @UseGuards(JwtAuthGuard)
  async notifyServiceRequestStatus(
    @Body() body: { serviceRequestId: string; status: string },
  ) {
    return this.notificationService.notifyServiceRequestStatus(body.serviceRequestId, body.status);
  }

  @Post('payment-confirmation')
  @UseGuards(JwtAuthGuard)
  async notifyPaymentConfirmation(@Body() body: { paymentId: string }) {
    return this.notificationService.notifyPaymentConfirmation(body.paymentId);
  }
}
