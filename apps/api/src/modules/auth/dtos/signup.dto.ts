export type SignupDto = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  userType?: 'customer' | 'owner';
  acceptedTerms?: boolean;
  allergyInfo?: string | null;
  rememberMe?: boolean;
};
