export type UserModel = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  allergyInfo: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  reviewCount?: number;
  favoritesCount?: number;
};
