import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async create(resortId: string, createRoomDto: CreateRoomDto) {
    // Verify resort exists
    const resort = await this.prisma.resort.findUnique({
      where: { id: resortId },
    });

    if (!resort) {
      throw new NotFoundException('Resort not found');
    }

    // Check if room number already exists for this resort
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        resortId,
        roomNumber: createRoomDto.roomNumber,
        deletedAt: null,
      },
    });

    if (existingRoom) {
      throw new BadRequestException('Room number already exists in this resort');
    }

    const qrCode = uuidv4();
    const qrCodeUrl = await this.generateQRCode(qrCode);

    return this.prisma.room.create({
      data: {
        ...createRoomDto,
        resortId,
        qrCode,
        qrCodeUrl,
      },
    });
  }

  async findAll(resortId: string) {
    return this.prisma.room.findMany({
      where: { resortId, deletedAt: null },
      include: {
        _count: {
          select: { orders: true, serviceRequests: true },
        },
      },
    });
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true, serviceRequests: true },
        },
      },
    });

    if (!room || room.deletedAt) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async findByQRCode(qrCode: string) {
    const room = await this.prisma.room.findUnique({
      where: { qrCode },
    });

    if (!room || room.deletedAt) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const room = await this.findById(id);

    if (updateRoomDto.roomNumber && updateRoomDto.roomNumber !== room.roomNumber) {
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          resortId: room.resortId,
          roomNumber: updateRoomDto.roomNumber,
          deletedAt: null,
        },
      });

      if (existingRoom) {
        throw new BadRequestException('Room number already exists in this resort');
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['available', 'occupied', 'maintenance'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    return this.prisma.room.update({
      where: { id },
      data: { status },
    });
  }

  async bulkCreate(resortId: string, rooms: CreateRoomDto[]) {
    const resort = await this.prisma.resort.findUnique({
      where: { id: resortId },
    });

    if (!resort) {
      throw new NotFoundException('Resort not found');
    }

    const createdRooms = [];

    for (const roomData of rooms) {
      const qrCode = uuidv4();
      const qrCodeUrl = await this.generateQRCode(qrCode);

      const room = await this.prisma.room.create({
        data: {
          ...roomData,
          resortId,
          qrCode,
          qrCodeUrl,
        },
      });

      createdRooms.push(room);
    }

    return createdRooms;
  }

  private async generateQRCode(data: string): Promise<string> {
    try {
      return await QRCode.toDataURL(data);
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }
}
