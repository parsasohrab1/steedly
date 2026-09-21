export type UserRole =
  | 'rider' // سوارکار
  | 'competitive_rider' // رایدر (مسابقه‌ای)
  | 'coach' // مربی
  | 'vet' // دامپزشک
  | 'farrier' // نعلبند
  | 'horse_transporter' // اسب‌کش
  | 'club_manager'; // مدیر باشگاه

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  rider: 'سوارکار',
  competitive_rider: 'رایدر',
  coach: 'مربی',
  vet: 'دامپزشک',
  farrier: 'نعلبند',
  horse_transporter: 'اسب‌کش',
  club_manager: 'مدیر باشگاه',
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRole[];
  bio?: string;
  /** URL to an uploaded license/certificate — required in practice for vet/farrier/coach roles before they're marketplace-visible, but not enforced at registration time here. */
  credentialUrl?: string;
  createdAtIso: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roles: UserRole[];
  bio?: string;
  credentialUrl?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
