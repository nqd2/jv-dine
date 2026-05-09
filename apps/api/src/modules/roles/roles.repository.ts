import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleModel } from './models/role.model';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RoleModel[]> {
    const roles = await this.prisma.role.findMany({ orderBy: { id: 'asc' } });
    return roles.map((role) => ({
      id: role.id,
      roleName: role.role_name,
      description: role.description,
    }));
  }

  async findById(id: number): Promise<RoleModel | null> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    return role ? this.toModel(role) : null;
  }

  async create(data: CreateRoleDto): Promise<RoleModel> {
    const role = await this.prisma.role.create({
      data: {
        role_name: data.roleName,
        description: data.description,
      },
    });

    return this.toModel(role);
  }

  async update(id: number, data: UpdateRoleDto): Promise<RoleModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: {
        role_name: data.roleName,
        description: data.description,
      },
    });

    return this.toModel(role);
  }

  async delete(id: number): Promise<RoleModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const role = await this.prisma.role.delete({ where: { id } });
    return this.toModel(role);
  }

  private async exists(id: number): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true },
    });
    return role !== null;
  }

  private toModel(role: {
    id: number;
    role_name: string;
    description: string | null;
  }): RoleModel {
    return {
      id: role.id,
      roleName: role.role_name,
      description: role.description,
    };
  }
}
