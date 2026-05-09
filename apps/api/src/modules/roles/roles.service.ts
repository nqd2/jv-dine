import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { RoleModel } from './models/role.model';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  findAll(): Promise<RoleModel[]> {
    return this.rolesRepository.findAll();
  }

  findById(id: number): Promise<RoleModel | null> {
    return this.rolesRepository.findById(id);
  }

  create(data: CreateRoleDto): Promise<RoleModel> {
    return this.rolesRepository.create(data);
  }

  update(id: number, data: UpdateRoleDto): Promise<RoleModel | null> {
    return this.rolesRepository.update(id, data);
  }

  delete(id: number): Promise<RoleModel | null> {
    return this.rolesRepository.delete(id);
  }
}
