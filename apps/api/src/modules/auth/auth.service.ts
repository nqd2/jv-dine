import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { UserModel } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import type { LoginDto } from './dtos/login.dto';
import type { RefreshTokenDto } from './dtos/refresh-token.dto';
import type { SignupDto } from './dtos/signup.dto';
import type { AuthResponseModel } from './models/auth-response.model';
import { hashPassword, verifyPassword } from './utils/password-hash';

type TokenType = 'access' | 'refresh';

type AuthJwtPayload = {
  sub: number;
  email: string;
  roleId: number;
  roleName: string;
  type: TokenType;
  rememberMe?: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(body: SignupDto): Promise<AuthResponseModel> {
    const email = this.normalizeEmail(body.email);
    const username = this.requiredString(body.username, 'username');
    const password = this.requiredString(body.password, 'password');

    this.assertEmail(email);
    this.assertPassword(password);

    if (body.passwordConfirmation && body.passwordConfirmation !== password) {
      throw new BadRequestException('Password confirmation does not match');
    }

    if (body.acceptedTerms !== true) {
      throw new BadRequestException('Terms must be accepted');
    }

    const existingUser = await this.usersService.findByEmailForAuth(email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const role = this.resolveRole(body.userType);
    await this.usersService.ensureRole(role.id, role.name);

    const user = await this.usersService.create({
      username,
      email,
      password: await hashPassword(password),
      roleId: role.id,
      allergyInfo: body.allergyInfo ?? null,
      isVerified: false,
    });

    return await this.buildAuthResponse(user, body.rememberMe === true);
  }

  async login(body: LoginDto): Promise<AuthResponseModel> {
    const email = this.normalizeEmail(body.email);
    const password = this.requiredString(body.password, 'password');

    this.assertEmail(email);

    const user = await this.usersService.findByEmailForAuth(email);
    if (!user || !(await verifyPassword(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return await this.buildAuthResponse(user, body.rememberMe === true);
  }

  async refresh(body: RefreshTokenDto): Promise<AuthResponseModel> {
    const refreshToken = this.requiredString(body.refreshToken, 'refreshToken');
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return await this.buildAuthResponse(user, payload.rememberMe === true);
  }

  private async buildAuthResponse(
    user: UserModel,
    rememberMe: boolean,
  ): Promise<AuthResponseModel> {
    const accessExpiresIn = this.getTokenTtl('JWT_ACCESS_TOKEN_TTL', '15m');
    const refreshExpiresIn = rememberMe
      ? this.getTokenTtl('JWT_REMEMBER_REFRESH_TOKEN_TTL', '30d')
      : this.getTokenTtl('JWT_REFRESH_TOKEN_TTL', '7d');

    const accessPayload = this.createPayload(user, 'access', rememberMe);
    const refreshPayload = this.createPayload(user, 'refresh', rememberMe);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getSecret('access'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.getSecret('refresh'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: String(accessExpiresIn),
        refreshExpiresIn: String(refreshExpiresIn),
      },
    };
  }

  private async verifyRefreshToken(token: string): Promise<AuthJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
        secret: this.getSecret('refresh'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private createPayload(
    user: UserModel,
    type: TokenType,
    rememberMe: boolean,
  ): AuthJwtPayload {
    return {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      type,
      rememberMe,
    };
  }

  private resolveRole(userType: SignupDto['userType']): {
    id: number;
    name: string;
  } {
    if (userType === 'owner') {
      return { id: 2, name: 'OWNER' };
    }

    return { id: 1, name: 'USER' };
  }

  private getSecret(type: TokenType): string {
    const secret =
      type === 'access'
        ? (process.env.JWT_ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET)
        : (process.env.JWT_REFRESH_TOKEN_SECRET ?? process.env.JWT_SECRET);

    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    return secret;
  }

  private getTokenTtl(
    envName: string,
    fallback: string,
  ): JwtSignOptions['expiresIn'] {
    return (process.env[envName] ?? fallback) as JwtSignOptions['expiresIn'];
  }

  private normalizeEmail(value: string): string {
    return this.requiredString(value, 'email').toLowerCase();
  }

  private requiredString(value: string | undefined, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${field} is required`);
    }

    return value.trim();
  }

  private assertEmail(email: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Email format is invalid');
    }
  }

  private assertPassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }
}
