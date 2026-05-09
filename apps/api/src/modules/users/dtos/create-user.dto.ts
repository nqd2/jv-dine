export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
  roleId: number;
  allergyInfo?: string | null;
  isVerified?: boolean;
};
