export type UpdateUserDto = {
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  allergyInfo?: string | null;
  isVerified?: boolean;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
};
