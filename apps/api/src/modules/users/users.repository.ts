import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserModel } from './models/user.model';

export type UserAuthRecord = UserModel & {
  password: string;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserModel[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      include: { role: true },
    });

    return users.map((user) => this.toModel(user));
  }

  async findById(id: number): Promise<UserModel | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    const [reviewCount, favoritesCount] = await Promise.all([
      this.prisma.review.count({ where: { user_id: id } }),
      this.prisma.userFavorite.count({ where: { user_id: id } }),
    ]);

    return {
      ...this.toModel(user),
      reviewCount,
      favoritesCount,
    };
  }

  async findByEmailForAuth(email: string): Promise<UserAuthRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return {
      ...this.toModel(user),
      password: user.password,
    };
  }

  async ensureRole(id: number, roleName: string): Promise<void> {
    await this.prisma.role.upsert({
      where: { id },
      update: {},
      create: {
        id,
        role_name: roleName,
        description:
          roleName === 'OWNER'
            ? 'Restaurant owner role'
            : 'General customer role',
      },
    });
  }

  async create(data: CreateUserDto): Promise<UserModel> {
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role_id: data.roleId,
        allergy_info: data.allergyInfo,
        is_verified: data.isVerified,
      },
      include: { role: true },
    });

    return this.toModel(user);
  }

  async update(id: number, data: UpdateUserDto): Promise<UserModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        role_id: data.roleId,
        allergy_info: data.allergyInfo,
        phone: data.phone,
        location: data.location,
        bio: data.bio,
        avatar_url: data.avatarUrl,
        is_verified: data.isVerified,
      },
      include: { role: true },
    });

    return this.toModel(user);
  }

  async delete(id: number): Promise<UserModel | null> {
    const exists = await this.exists(id);
    if (!exists) {
      return null;
    }

    const user = await this.prisma.user.delete({
      where: { id },
      include: { role: true },
    });

    return this.toModel(user);
  }

  private async exists(id: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return user !== null;
  }

  private toModel(user: {
    id: number;
    username: string;
    email: string;
    role_id: number;
    allergy_info: string | null;
    phone: string | null;
    location: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    created_at: Date;
    role: {
      role_name: string;
    };
  }): UserModel {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role.role_name,
      allergyInfo: user.allergy_info,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified,
      createdAt: user.created_at.toISOString(),
    };
  }
}
