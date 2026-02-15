import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('resorts/:resortId/menus')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // ============ MENU ENDPOINTS ============

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMenu(@Param('resortId') resortId: string, @Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(resortId, createMenuDto);
  }

  @Get()
  async findAllMenus(@Param('resortId') resortId: string) {
    return this.menuService.findAllMenus(resortId);
  }

  @Get('guest')
  async getMenuForGuest(@Param('resortId') resortId: string) {
    return this.menuService.getMenuForGuest(resortId);
  }

  @Get(':menuId')
  async findMenuById(@Param('menuId') menuId: string) {
    return this.menuService.findMenuById(menuId);
  }

  @Put(':menuId')
  @UseGuards(JwtAuthGuard)
  async updateMenu(@Param('menuId') menuId: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.updateMenu(menuId, updateMenuDto);
  }

  @Delete(':menuId')
  @UseGuards(JwtAuthGuard)
  async deleteMenu(@Param('menuId') menuId: string) {
    return this.menuService.deleteMenu(menuId);
  }

  // ============ MENU ITEM ENDPOINTS ============

  @Post(':menuId/items')
  @UseGuards(JwtAuthGuard)
  async createMenuItem(
    @Param('resortId') resortId: string,
    @Param('menuId') menuId: string,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuService.createMenuItem(resortId, menuId, createMenuItemDto);
  }

  @Get(':menuId/items')
  async findAllMenuItems(@Param('resortId') resortId: string, @Param('menuId') menuId: string) {
    return this.menuService.findAllMenuItems(resortId, menuId);
  }

  @Get('items/:itemId')
  async findMenuItemById(@Param('itemId') itemId: string) {
    return this.menuService.findMenuItemById(itemId);
  }

  @Put('items/:itemId')
  @UseGuards(JwtAuthGuard)
  async updateMenuItem(@Param('itemId') itemId: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(itemId, updateMenuItemDto);
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  async deleteMenuItem(@Param('itemId') itemId: string) {
    return this.menuService.deleteMenuItem(itemId);
  }

  @Put('items/:itemId/toggle-availability')
  @UseGuards(JwtAuthGuard)
  async toggleMenuItemAvailability(@Param('itemId') itemId: string) {
    return this.menuService.toggleMenuItemAvailability(itemId);
  }
}
