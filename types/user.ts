export interface UserProfile {
  id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  role?: string;
  profile_image_url?: string | null;
  photo_profile?: string | null;
  wallet_address?: string | null;
  alamat?: string | null;
  is_verified?: boolean | number;
  beneficiary_type?: string;
  domicile_province?: string;
  domicile_city?: string;
  domicile_district?: string;
  domicile_village?: string;
  [key: string]: unknown;
}

export interface Region {
  id: string;
  name: string;
}
