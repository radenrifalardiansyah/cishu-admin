export const BRAND_NAME = 'Cishu';

export const ADMIN_APP_NAME = 'Admin Cishu';

export const WHATSAPP_NUMBER = '6281212132014';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cishu.vercel.app';
export const productUrl = (id: string) => `${SITE_URL}/products/${id}`;

export const THEME_COLOR = '#D4691E';
export const THEME_BACKGROUND_COLOR = '#1C1917';

// Tema bawaan panel admin (biru). THEME_COLOR di atas tetap dipakai dokumen PDF/brand toko.
export const ADMIN_THEME_COLOR = '#1D4FE0';
export const ADMIN_THEME_BACKGROUND_COLOR = '#0A1330';

export const DEVELOPER = {
  name: 'PT. Eleven Digital Indonesia',
  url: 'https://elevendigital-id.vercel.app',
  supportedBy: 'RMedia Solutions',
};
