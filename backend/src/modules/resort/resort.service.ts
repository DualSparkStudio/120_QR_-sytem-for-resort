import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateResortDto, UpdateResortDto } from './dto/resort.dto';

@Injectable()
export class ResortService {
  constructor(private prisma: PrismaService) {}

  async create(createResortDto: CreateResortDto) {
    const existingResort = await this.prisma.resort.findUnique({
      where: { slug: createResortDto.slug },
    });

    if (existingResort) {
      throw new BadRequestException('Resort slug already exists');
    }

    return this.prisma.resort.create({
      data: createResortDto,
    });
  }

  async findAll() {
    return this.prisma.resort.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { rooms: true, orders: true },
        },
      },
    });
  }

  async findById(id: string) {
    const resort = await this.prisma.resort.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rooms: true, orders: true, staff: true },
        },
      },
    });

    if (!resort || resort.deletedAt) {
      throw new NotFoundException('Resort not found');
    }

    return resort;
  }

  async findBySlug(slug: string) {
    const resort = await this.prisma.resort.findUnique({
      where: { slug },
    });

    if (!resort || resort.deletedAt) {
      throw new NotFoundException('Resort not found');
    }

    return resort;
  }

  async update(id: string, updateResortDto: UpdateResortDto) {
    const resort = await this.findById(id);

    if (updateResortDto.slug && updateResortDto.slug !== resort.slug) {
      const existingSlug = await this.prisma.resort.findUnique({
        where: { slug: updateResortDto.slug },
      });
      if (existingSlug) {
        throw new BadRequestException('Resort slug already exists');
      }
    }

    return this.prisma.resort.update({
      where: { id },
      data: updateResortDto,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.resort.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats(resortId: string) {
    const resort = await this.findById(resortId);

    const [totalRooms, occupiedRooms, totalOrders, totalRevenue] = await Promise.all([
      this.prisma.room.count({ where: { resortId } }),
      this.prisma.room.count({ where: { resortId, status: 'occupied' } }),
      this.prisma.order.count({ where: { resortId } }),
      this.prisma.payment.aggregate({
        where: { resortId, status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      resort,
      totalRooms,
      occupiedRooms,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
      totalOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
