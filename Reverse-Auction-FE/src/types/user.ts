export interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
}

export interface UserWithToken {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
