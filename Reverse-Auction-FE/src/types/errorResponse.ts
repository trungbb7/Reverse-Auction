export interface ErrorResponse {
  error?: string;
  message?: string;
  status?: number;
  timestamp?: string;
  fieldErrors: Record<string, string>;
}
