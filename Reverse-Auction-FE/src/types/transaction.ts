export interface Transaction {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW" | "PAYMENT" | "REFUND";
  status: "PENDING" | "SUCCESS" | "FAILED";
  code: string;
  description: string;
  createdAt: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}
