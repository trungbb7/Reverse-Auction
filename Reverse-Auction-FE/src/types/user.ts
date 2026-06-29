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
  identityNumber?: string;
  frontIdentity?: string;
  backIdentity?: string;
  businessLicense?: string;
  kycStatus?: "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
  kycMessage?: string;
}

export interface UserWithToken {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
