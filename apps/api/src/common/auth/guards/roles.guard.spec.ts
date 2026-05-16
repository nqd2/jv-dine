import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createContext(user?: {
  id: number;
  email: string;
  roleId: number;
  roleName: string;
}): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  beforeEach(() => {
    jest.clearAllMocks();
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key) => {
      if (key === 'isPublic') {
        return false;
      }
      if (key === 'roles') {
        return ['OWNER', 'USER'];
      }
      return undefined;
    });
  });

  it('allows owner when role_name is localized but roleId is 2', () => {
    expect(
      guard.canActivate(
        createContext({
          id: 1,
          email: 'owner@example.com',
          roleId: 2,
          roleName: '店舗オーナー',
        }),
      ),
    ).toBe(true);
  });

  it('allows user when role_name is localized but roleId is 1', () => {
    expect(
      guard.canActivate(
        createContext({
          id: 2,
          email: 'user@example.com',
          roleId: 1,
          roleName: '一般ユーザー（日本人客）',
        }),
      ),
    ).toBe(true);
  });

  it('rejects unknown role id', () => {
    expect(() =>
      guard.canActivate(
        createContext({
          id: 3,
          email: 'x@example.com',
          roleId: 99,
          roleName: 'Admin',
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
