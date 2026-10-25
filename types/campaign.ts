export type CampaignBanner = string | string[] | null;

export interface Campaign {
  id: string | number;
  slug?: string;
  name?: string | null;
  title?: string;
  campaign_code?: string;
  status?: string;
  target_amount?: number | string | null;
  current_amount?: number | string | null;
  live_collected?: number | string | null;
  end_date?: string | null;
  created_at?: string | null;
  image_banner?: CampaignBanner;
  full_name?: string;
  category_id?: number;
  is_wakaf?: boolean | number | string;
  user_id?: string | number | null;
  wallet_address?: string | null;
  description?: string | null;
  short_description?: string | null;
  story?: string | null;
  reject_reason?: string | null;
  reason?: string | null;
  user?: {
    wallet_address?: string | null;
    full_name?: string | null;
  } | null;
  [key: string]: unknown;
}

export interface WalletTransaction {
  tx_hash: string;
  date: string;
  type: string;
  amount: string;
  from_to: string;
  [key: string]: unknown;
}

export interface DonationHistoryItem {
  from_to?: string;
  date?: string;
  amount?: number | string;
  [key: string]: unknown;
}
