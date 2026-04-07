import { createContext, useContext, type ReactNode } from "react";
import { useGetSettings } from "@workspace/api-client-react";

interface SiteSettings {
  siteName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementText: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleAdsId: string;
  freeShippingThreshold: string;
  shippingCost: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
}

const defaults: SiteSettings = {
  siteName: "TryNex Lifestyle",
  tagline: "You Imagine, We Craft.",
  phone: "",
  whatsappNumber: "",
  email: "",
  address: "",
  heroTitle: "",
  heroSubtitle: "",
  announcementText: "",
  googleAnalyticsId: "",
  facebookPixelId: "",
  googleAdsId: "",
  freeShippingThreshold: "1500",
  shippingCost: "80",
  bkashNumber: "",
  nagadNumber: "",
  rocketNumber: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
};

const SiteSettingsContext = createContext<SiteSettings>(defaults);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data } = useGetSettings();
  const settings: SiteSettings = { ...defaults, ...(data as Partial<SiteSettings> || {}) };
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
