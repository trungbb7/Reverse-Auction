export interface User {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  address?: string;
  enabled?: boolean;
  verified?: boolean;
  provider?: "LOCAL" | "GOOGLE";
  balance?: number;
  imageUrl?: string;
  description?: string;
}

export interface UserWithToken {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
