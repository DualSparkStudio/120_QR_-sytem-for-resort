import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ResortService } from './resort.service';
import { CreateResortDto, UpdateResortDto } from './dto/resort.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resorts')
export class ResortController {
  constructor(private resortService: ResortService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createResortDto: CreateResortDto) {
    return this.resortService.create(createResortDto);
  }

  @Get()
  async findAll() {
    return this.resortService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.resortService.findById(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.resortService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateResortDto: UpdateResortDto) {
    return this.resortService.update(id, updateResortDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.resortService.delete(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Param('id') id: string) {
    return this.resortService.getStats(id);
  }
}
