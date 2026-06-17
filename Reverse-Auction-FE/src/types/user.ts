export interface User {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  enabled: boolean;
  cccdNumber?: string;
  cccdFrontImage?: string;
  cccdBackImage?: string;
  kycStatus?: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  kycMessage?: string;
}

export interface UserWithToken {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
