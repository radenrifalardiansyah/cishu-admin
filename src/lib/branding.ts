export const BRAND_NAME = "Cishu Bite 'n Sip";

export const ADMIN_APP_NAME = 'Admin Cishu';

export const WHATSAPP_NUMBER = '6281212132014';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cishu.vercel.app';
export const productUrl = (id: string) => `${SITE_URL}/products/${id}`;

export const THEME_COLOR = '#1D6FC4';
export const THEME_BACKGROUND_COLOR = '#1D6FC4';

// Tema bawaan panel admin = tema dokumen (PDF/Excel): satu biru yang sama.
export const ADMIN_THEME_COLOR = THEME_COLOR;
export const ADMIN_THEME_BACKGROUND_COLOR = THEME_BACKGROUND_COLOR;

export const DEVELOPER = {
  name: 'PT. Eleven Digital Indonesia',
  url: 'https://elevendigital-id.vercel.app',
  supportedBy: 'RMedia Solutions',
};
