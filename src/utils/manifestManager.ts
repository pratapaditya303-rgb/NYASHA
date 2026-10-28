export interface AppManifestConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui';
  orientation: 'portrait-primary' | 'any';
  startUrl: string;
  scope: string;
}

export const DEFAULT_MANIFEST_CONFIG: AppManifestConfig = {
  name: 'NYAAY SAHAYOGI - Bar & Legal ERP',
  shortName: 'Nyaay Sahayogi',
  description: 'Official Bar Council, District Bar Association & Advocate ERP Portal with QR ID Cards, Case Diary, Legal Drafting & e-Voting',
  themeColor: '#020617',
  backgroundColor: '#020617',
  display: 'standalone',
  orientation: 'portrait-primary',
  startUrl: '/',
  scope: '/'
};

const MANIFEST_STORAGE_KEY = 'nyaay_superadmin_manifest_config';

export function getManifestConfig(): AppManifestConfig {
  if (typeof window === 'undefined') return DEFAULT_MANIFEST_CONFIG;
  try {
    const raw = localStorage.getItem(MANIFEST_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_MANIFEST_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to parse stored manifest config:', err);
  }
  return DEFAULT_MANIFEST_CONFIG;
}

export function saveManifestConfig(newConfig: Partial<AppManifestConfig>): AppManifestConfig {
  const current = getManifestConfig();
  const updated: AppManifestConfig = { ...current, ...newConfig };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(MANIFEST_STORAGE_KEY, JSON.stringify(updated));
    applyManifestToDOM(updated);
  }
  
  return updated;
}

export function resetManifestConfig(): AppManifestConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MANIFEST_STORAGE_KEY);
    applyManifestToDOM(DEFAULT_MANIFEST_CONFIG);
  }
  return DEFAULT_MANIFEST_CONFIG;
}

export function generateManifestJson(config: AppManifestConfig = getManifestConfig()) {
  return {
    id: config.startUrl,
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: config.startUrl,
    scope: config.scope,
    display: config.display,
    orientation: config.orientation,
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ]
  };
}

export function applyManifestToDOM(config: AppManifestConfig = getManifestConfig()): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Update theme color meta tag
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', config.themeColor);
    }

    // 2. Update apple mobile app title
    const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appleTitleMeta) {
      appleTitleMeta.setAttribute('content', config.shortName);
    }

    // 3. Update dynamic blob manifest link if custom config differs from default
    const manifestJson = generateManifestJson(config);
    const manifestBlob = new Blob([JSON.stringify(manifestJson, null, 2)], { type: 'application/manifest+json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;

    // 4. Notify app
    window.dispatchEvent(new CustomEvent('app_manifest_updated', { detail: config }));
  } catch (err) {
    console.error('Failed to apply dynamic manifest to DOM:', err);
  }
}
