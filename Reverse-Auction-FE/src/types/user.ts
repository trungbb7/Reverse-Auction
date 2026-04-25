export interface User {
  email?: string;
  role?: string;
  fullName?: string;
}

export interface UserWithToken {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
