import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserModel } from './models/user.model';
import { UserAuthRecord, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findAll(): Promise<UserModel[]> {
    return this.usersRepository.findAll();
  }

  findById(id: number): Promise<UserModel | null> {
    return this.usersRepository.findById(id);
  }

  findByEmailForAuth(email: string): Promise<UserAuthRecord | null> {
    return this.usersRepository.findByEmailForAuth(email);
  }

  ensureRole(id: number, roleName: string): Promise<void> {
    return this.usersRepository.ensureRole(id, roleName);
  }

  create(data: CreateUserDto): Promise<UserModel> {
    return this.usersRepository.create(data);
  }

  update(id: number, data: UpdateUserDto): Promise<UserModel | null> {
    return this.usersRepository.update(id, data);
  }

  delete(id: number): Promise<UserModel | null> {
    return this.usersRepository.delete(id);
  }
}
