export type UserModel = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  allergyInfo: string | null;
  isVerified: boolean;
  createdAt: string;
};
