import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resorts/:resortId/rooms')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Param('resortId') resortId: string, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(resortId, createRoomDto);
  }

  @Get()
  async findAll(@Param('resortId') resortId: string) {
    return this.roomService.findAll(resortId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.roomService.findById(id);
  }

  @Get('qr/:qrCode')
  async findByQRCode(@Param('qrCode') qrCode: string) {
    return this.roomService.findByQRCode(qrCode);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.roomService.delete(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.roomService.updateStatus(id, body.status);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  async bulkCreate(@Param('resortId') resortId: string, @Body() body: { rooms: CreateRoomDto[] }) {
    return this.roomService.bulkCreate(resortId, body.rooms);
  }
}
