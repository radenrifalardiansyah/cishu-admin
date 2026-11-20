import { NextRequest } from 'next/server';
import { requirePermission } from '@/lib/rbac';
import { getSettings } from '@/lib/settings-pg';
import { isValidIdMobile, PHONE_FORMAT_HINT } from '@/lib/phone';
import { cleanCallmebotKey, sendCallmebot } from '@/lib/callmebot';

export const runtime = 'nodejs';

// Pembatas laju sederhana (per pengguna, per instance server): satu pesan tes per 30 detik agar tombol
// tidak bisa dipakai menghabiskan kuota CallMeBot. Best effort — bukan pengaman keras di serverless.
const TEST_COOLDOWN_MS = 30_000;
const lastTestAt = new Map<string, number>();

// Kirim pesan tes CallMeBot. Body opsional { phone, apiKey } = nilai di form yang belum disimpan;
// yang kosong memakai nilai tersimpan di Pengaturan, jadi key tidak perlu dikirim ulang dari klien.
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, 'settings', 'edit');
  if (guard instanceof Response) return guard;
  const now = Date.now();
  const wait = TEST_COOLDOWN_MS - (now - (lastTestAt.get(guard.username) ?? 0));
  if (wait > 0) {
    return Response.json({ error: `Tunggu ${Math.ceil(wait / 1000)} detik sebelum mengirim pesan tes lagi.` }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => ({})) as { phone?: unknown; apiKey?: unknown };
    const s = await getSettings() as { storeName?: string; notifyPhone?: string; callmebotApiKey?: string };

    const phone = (typeof body.phone === 'string' && body.phone.trim()) || s.notifyPhone?.trim() || '';
    const typedKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const apiKey = typedKey ? cleanCallmebotKey(typedKey) : (s.callmebotApiKey ?? '');

    if (!phone) return Response.json({ error: 'Isi nomor tujuan notifikasi dulu.' }, { status: 400 });
    if (!isValidIdMobile(phone)) return Response.json({ error: PHONE_FORMAT_HINT }, { status: 400 });
    if (!apiKey) return Response.json({ error: typedKey ? 'API key tidak valid (hanya huruf/angka, 3–64 karakter).' : 'Isi API key CallMeBot dulu.' }, { status: 400 });

    lastTestAt.set(guard.username, now); // dihitung setelah input lolos validasi, supaya salah isi tidak memicu jeda
    const name = s.storeName?.trim() || 'Toko';
    const r = await sendCallmebot(phone, apiKey, `*Tes notifikasi — ${name}*\nPesan ini dikirim dari menu Pengaturan. Notifikasi WhatsApp aktif.`);
    if (!r.ok) return Response.json({ error: `CallMeBot menolak: ${r.detail || 'tanpa keterangan'}` }, { status: 502 });
    return Response.json({ ok: true, detail: r.detail });
  } catch (err) {
    console.error('[settings/test-callmebot]', err);
    return Response.json({ error: 'Gagal mengirim pesan tes.' }, { status: 500 });
  }
}
