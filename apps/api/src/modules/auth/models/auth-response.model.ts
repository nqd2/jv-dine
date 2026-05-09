import type { UserModel } from '../../users/models/user.model';

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  refreshExpiresIn: string;
};

export type AuthResponseModel = {
  user: UserModel;
  tokens: AuthTokenPair;
};
