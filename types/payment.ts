export interface PaymentMethod {
  id: string;
  name: string;
  logo?: string;
  [key: string]: unknown;
}

export interface QrisData {
  qris_string?: string;
  qr_string?: string;
  payment_code?: string;
  [key: string]: unknown;
}

export interface VaData {
  va_number?: string;
  bank?: string;
  [key: string]: unknown;
}

export interface TransactionDetail {
  id?: string | number;
  transaction_code?: string;
  campaign_name?: string;
  sender_name?: string;
  amount?: number;
  status?: string;
  transfer_notes?: string;
  payment_code?: string;
  va_number?: string;
  [key: string]: unknown;
}
