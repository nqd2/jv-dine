import { Injectable } from '@nestjs/common';
import { hashPassword } from '../auth/utils/password-hash';
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

  async create(data: CreateUserDto): Promise<UserModel> {
    const password = await this.hashPasswordIfNeeded(data.password);
    return this.usersRepository.create({ ...data, password });
  }

  async update(id: number, data: UpdateUserDto): Promise<UserModel | null> {
    const password =
      data.password === undefined
        ? undefined
        : await this.hashPasswordIfNeeded(data.password);
    return this.usersRepository.update(id, { ...data, password });
  }

  private async hashPasswordIfNeeded(password: string): Promise<string> {
    if (password.startsWith('scrypt:')) {
      return password;
    }
    return hashPassword(password);
  }

  delete(id: number): Promise<UserModel | null> {
    return this.usersRepository.delete(id);
  }
}
