import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../auth.constants';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const verifyAsync = jest.fn();
  const jwtService = {
    verifyAsync,
  } as unknown as JwtService;

  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new JwtAuthGuard(reflector, jwtService);

  function createContext(authHeader?: string): ExecutionContext {
    const request: {
      headers: { authorization?: string };
      user?: unknown;
    } = { headers: {} };
    if (authHeader) {
      request.headers.authorization = authHeader;
    }

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_TOKEN_SECRET = 'test-access-secret';
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
  });

  it('allows public routes without a token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) =>
      key === IS_PUBLIC_KEY ? true : false,
    );

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects missing bearer token', async () => {
    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches user from a valid access token', async () => {
    verifyAsync.mockResolvedValue({
      sub: 7,
      email: 'owner@example.com',
      roleId: 2,
      roleName: 'OWNER',
      type: 'access',
    });

    const context = createContext('Bearer valid-token');
    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context
      .switchToHttp()
      .getRequest<{ user: { id: number } }>();
    expect(request.user).toEqual({
      id: 7,
      email: 'owner@example.com',
      roleId: 2,
      roleName: 'OWNER',
    });
  });
});
