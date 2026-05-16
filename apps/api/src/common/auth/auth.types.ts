export type AuthenticatedUser = {
  id: number;
  email: string;
  roleId: number;
  roleName: string;
};

export type JwtAccessPayload = {
  sub: number;
  email: string;
  roleId: number;
  roleName: string;
  type: 'access' | 'refresh';
};
