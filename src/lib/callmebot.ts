import { normalizePhone } from '@/lib/phone';

// Notifikasi WhatsApp lewat CallMeBot. Nomor tujuan + API key disimpan di settings.main
// (`notifyPhone`, `callmebotApiKey`) dan diisi dari menu Pengaturan; storefront membacanya dari
// tabel yang sama (env CALLMEBOT_API_KEY/NOTIFY_PHONE hanya fallback di sana).

// Key dari CallMeBot berupa token pendek (angka/huruf). Batasi karakter & panjang supaya tidak
// bisa menyusupkan parameter lain ke URL dan input yang jelas salah ditolak sejak awal.
export function cleanCallmebotKey(raw: unknown): string | null {
  const v = typeof raw === 'string' ? raw.trim() : '';
  return /^[A-Za-z0-9_-]{3,64}$/.test(v) ? v : null;
}

export function maskCallmebotKey(key: string): string {
  return key.length <= 4 ? '••••' : `••••${key.slice(-4)}`;
}

export async function sendCallmebot(
  phoneRaw: string, apiKey: string, text: string,
): Promise<{ ok: boolean; detail: string }> {
  const phone = normalizePhone(phoneRaw);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    // CallMeBot membalas halaman HTML pendek berisi alasan (mis. "APIKey is invalid") — ambil teksnya saja.
    const body = (await res.text()).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    return { ok: res.ok, detail: body };
  } catch {
    return { ok: false, detail: 'CallMeBot tidak dapat dihubungi (timeout/jaringan).' };
  }
}
