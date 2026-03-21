import { applyTheme, type ThemeConfig } from "./theme";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  settings: {
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      logo?: string;
      businessName?: string;
    };
    industry?: string;
    schemaId?: string;
  } | null;
}

// resolve tenant from slug or current domain
export async function fetchTenantConfig(slug?: string): Promise<TenantConfig | null> {
  try {
    const endpoint = slug ? `${API_BASE}/tenants/${slug}` : `${API_BASE}/tenants/current`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!slug && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length >= 3) {
        headers["x-tenant-slug"] = parts[0];
      }
    }

    const response = await fetch(endpoint, { headers });
    if (!response.ok) return null;

    const data = await response.json();
    return data.tenant ?? data;
  } catch {
    return null;
  }
}

// apply tenant branding to the page
export function applyTenantBranding(tenant: TenantConfig): void {
  const branding = tenant.settings?.branding;
  if (!branding) return;

  const theme: ThemeConfig = {
    primary: branding.primaryColor ?? "#a7c7e7",
    secondary: branding.secondaryColor ?? "#b8e0d2",
    accent: branding.accentColor ?? "#ffc9b9",
    logo: branding.logo,
    businessName: branding.businessName ?? tenant.name,
  };

  applyTheme(theme);
}
