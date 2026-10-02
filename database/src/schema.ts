export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  passwordHash?: string | null;
  authProvider: 'email' | 'google' | 'apple';
  authProviderId?: string | null;
  subscriptionPlan: 'free' | 'pro' | 'business';
  subscriptionStatus: 'active' | 'trial' | 'expired';
  isAdmin: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  primaryColor: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  googleMapsUrl?: string | null;
  googlePlaceId?: string | null;
  googleReviewUrl?: string | null;
  rating: number;
  reviewCount: number;
  whatsappNumber?: string | null;
  totalScans: number;
  totalClicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  businessId: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'website' | 'google_maps' | 'google_review' | 'phone' | 'custom';
  label?: string | null;
  url: string;
  displayOrder: number;
  clicks: number;
  isActive: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  businessId: string;
  title: string;
  description?: string | null;
  price?: string | null;
  emoji: string;
  tag?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface QRCode {
  id: string;
  businessId: string;
  label: string;
  destinationUrl: string;
  scans: number;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  businessId: string;
  eventType: 'qr_scan' | 'profile_view' | 'link_click' | 'google_review_click' | 'google_maps_click' | 'whatsapp_click' | 'website_click' | 'phone_click';
  targetId?: string | null;
  targetLabel?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  referer?: string | null;
  createdAt: string;
}
