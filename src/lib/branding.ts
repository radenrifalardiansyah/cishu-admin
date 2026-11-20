export const BRAND_NAME = "Cishu Bite 'n Sip";

export const ADMIN_APP_NAME = 'Admin Cishu';

export const WHATSAPP_NUMBER = ''; // dikosongkan: nomor toko diisi lewat Pengaturan (settings.whatsapp)

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cishu.vercel.app';
export const productUrl = (id: string) => `${SITE_URL}/products/${id}`;

export const THEME_COLOR = '#C93C55';
export const THEME_BACKGROUND_COLOR = '#C93C55';

// Tema bawaan panel admin = tema dokumen (PDF/Excel): satu warna merek yang sama (rose-coral logo).
export const ADMIN_THEME_COLOR = THEME_COLOR;
export const ADMIN_THEME_BACKGROUND_COLOR = THEME_BACKGROUND_COLOR;

export const DEVELOPER = {
  name: 'PT. Eleven Digital Indonesia',
  url: 'https://elevendigital-id.vercel.app',
  supportedBy: 'RMedia Solutions',
};
