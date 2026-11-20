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

// Key CallMeBot pendek (6-7 karakter umum), jadi petunjuknya dibuat minim: dua karakter terakhir
// hanya bila key cukup panjang. Cukup untuk membedakan "sudah terisi", tidak untuk menebak key.
export function maskCallmebotKey(key: string): string {
  return key.length < 8 ? '••••' : `••••${key.slice(-2)}`;
}

// CallMeBot membalas halaman teks/HTML pendek, bukan JSON, dan bisa memakai status 2xx untuk alasan
// penolakan. Anggap gagal bila status bukan 2xx ATAU isi balasan memuat penanda penolakan
// (daftar penanda sengaja luas; teks sukses tidak dipakai agar notifikasi nyata tidak ikut terblokir).
const REJECT_PATTERN = /invalid|error|not\s+(?:authorized|valid|found|activated)|wrong|fail|blocked|too many|denied/i;
export function callmebotReplyOk(status: number, body: string): boolean {
  return status >= 200 && status < 300 && !REJECT_PATTERN.test(body);
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
    return { ok: callmebotReplyOk(res.status, body), detail: body };
  } catch (err) {
    // Hanya nama/pesan error (bukan URL) supaya API key tidak ikut tercatat di log.
    console.error('[callmebot]', err instanceof Error ? `${err.name}: ${err.message}` : 'error tidak dikenal');
    return { ok: false, detail: 'CallMeBot tidak dapat dihubungi (timeout/jaringan).' };
  }
}
