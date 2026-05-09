import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UserModel } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { hashPassword } from './utils/password-hash';

type MockUsersService = Pick<
  UsersService,
  'create' | 'ensureRole' | 'findByEmailForAuth' | 'findById'
>;

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<MockUsersService>;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync' | 'verifyAsync'>>;

  const user: UserModel = {
    id: 1,
    username: 'Taro',
    email: 'taro@example.com',
    roleId: 1,
    roleName: 'USER',
    allergyInfo: null,
    isVerified: false,
    createdAt: '2026-05-09T00:00:00.000Z',
  };

  beforeEach(() => {
    process.env.JWT_ACCESS_TOKEN_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_TOKEN_SECRET = 'test-refresh-secret';

    usersService = {
      create: jest.fn(),
      ensureRole: jest.fn(),
      findByEmailForAuth: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    jwtService.signAsync.mockImplementation((payload: { type: string }) =>
      Promise.resolve(`${payload.type}-token`),
    );

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('signs up a new customer and returns access and refresh tokens', async () => {
    usersService.findByEmailForAuth.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);

    const result = await authService.signup({
      username: ' Taro ',
      email: ' TARO@example.com ',
      password: 'password123',
      passwordConfirmation: 'password123',
      userType: 'customer',
      acceptedTerms: true,
    });

    expect(usersService.ensureRole).toHaveBeenCalledWith(1, 'USER');
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'Taro',
        email: 'taro@example.com',
        roleId: 1,
      }),
    );
    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.refreshToken).toBe('refresh-token');
  });

  it('rejects signup when email already exists', async () => {
    usersService.findByEmailForAuth.mockResolvedValue({
      ...user,
      password: await hashPassword('password123'),
    });

    await expect(
      authService.signup({
        username: 'Taro',
        email: 'taro@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        acceptedTerms: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with a hashed password', async () => {
    usersService.findByEmailForAuth.mockResolvedValue({
      ...user,
      password: await hashPassword('password123'),
    });

    const result = await authService.login({
      email: 'taro@example.com',
      password: 'password123',
      rememberMe: true,
    });

    expect(result.tokens.refreshExpiresIn).toBe('30d');
  });

  it('rejects login with an invalid password', async () => {
    usersService.findByEmailForAuth.mockResolvedValue({
      ...user,
      password: await hashPassword('password123'),
    });

    await expect(
      authService.login({
        email: 'taro@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes tokens only from a refresh token payload', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      type: 'refresh',
      rememberMe: false,
    });
    usersService.findById.mockResolvedValue(user);

    const result = await authService.refresh({ refreshToken: 'refresh-token' });

    expect(result.tokens.accessToken).toBe('access-token');
    expect(usersService.findById).toHaveBeenCalledWith(1);
  });
});
