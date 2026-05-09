import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type { CreateRoleDto } from './dtos/create-role.dto';
import type { UpdateRoleDto } from './dtos/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.findById(id);
    if (!role) {
      throw new NotFoundException(`Role ${id} was not found`);
    }
    return role;
  }

  @Post()
  async create(@Body() body: CreateRoleDto) {
    return await this.rolesService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(id, body);
    if (!role) {
      throw new NotFoundException(`Role ${id} was not found`);
    }
    return role;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.delete(id);
    if (!role) {
      throw new NotFoundException(`Role ${id} was not found`);
    }
    return role;
  }
}
