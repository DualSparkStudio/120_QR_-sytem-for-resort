import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto, CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ============ MENU MANAGEMENT ============

  async createMenu(resortId: string, createMenuDto: CreateMenuDto) {
    const resort = await this.prisma.resort.findUnique({
      where: { id: resortId },
    });

    if (!resort) {
      throw new NotFoundException('Resort not found');
    }

    const existingMenu = await this.prisma.menu.findFirst({
      where: {
        resortId,
        name: createMenuDto.name,
        deletedAt: null,
      },
    });

    if (existingMenu) {
      throw new BadRequestException('Menu already exists');
    }

    return this.prisma.menu.create({
      data: {
        ...createMenuDto,
        resortId,
      },
    });
  }

  async findAllMenus(resortId: string) {
    return this.prisma.menu.findMany({
      where: { resortId, deletedAt: null },
      include: {
        items: {
          where: { deletedAt: null },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findMenuById(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          where: { deletedAt: null },
          include: { variants: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!menu || menu.deletedAt) {
      throw new NotFoundException('Menu not found');
    }

    return menu;
  }

  async updateMenu(id: string, updateMenuDto: UpdateMenuDto) {
    await this.findMenuById(id);
    return this.prisma.menu.update({
      where: { id },
      data: updateMenuDto,
    });
  }

  async deleteMenu(id: string) {
    await this.findMenuById(id);
    return this.prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ============ MENU ITEM MANAGEMENT ============

  async createMenuItem(resortId: string, menuId: string, createMenuItemDto: CreateMenuItemDto) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu || menu.resortId !== resortId) {
      throw new NotFoundException('Menu not found');
    }

    const existingItem = await this.prisma.menuItem.findFirst({
      where: {
        resortId,
        menuId,
        name: createMenuItemDto.name,
        deletedAt: null,
      },
    });

    if (existingItem) {
      throw new BadRequestException('Menu item already exists');
    }

    return this.prisma.menuItem.create({
      data: {
        ...createMenuItemDto,
        resortId,
        menuId,
      },
    });
  }

  async findAllMenuItems(resortId: string, menuId: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu || menu.resortId !== resortId) {
      throw new NotFoundException('Menu not found');
    }

    return this.prisma.menuItem.findMany({
      where: { resortId, menuId, deletedAt: null },
      include: { variants: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findMenuItemById(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!item || item.deletedAt) {
      throw new NotFoundException('Menu item not found');
    }

    return item;
  }

  async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    await this.findMenuItemById(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: updateMenuItemDto,
    });
  }

  async deleteMenuItem(id: string) {
    await this.findMenuItemById(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleMenuItemAvailability(id: string) {
    const item = await this.findMenuItemById(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
    });
  }

  async getMenuForGuest(resortId: string) {
    const menus = await this.prisma.menu.findMany({
      where: { resortId, deletedAt: null },
      include: {
        items: {
          where: { deletedAt: null, isAvailable: true },
          include: { variants: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return menus.filter((menu) => menu.items.length > 0);
  }
}
