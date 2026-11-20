import { NextRequest, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requirePermission } from '@/lib/rbac';
import { getSettings, setSettings } from '@/lib/settings-pg';
import { CLOSING_PDF_TAG } from '@/lib/closing-wa';
import { revalidateStorefront } from '@/lib/revalidate';
import { isValidIdMobile, PHONE_FORMAT_HINT } from '@/lib/phone';
import { cleanCallmebotKey, maskCallmebotKey } from '@/lib/callmebot';

export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, 'settings', 'view');
  if (guard instanceof Response) return guard;
  // API key CallMeBot adalah rahasia: tidak pernah dikirim balik ke klien, hanya penanda sudah-diisi + 4 digit akhir.
  const { callmebotApiKey, ...settings } = await getSettings() as Record<string, unknown> & { callmebotApiKey?: string };
  return Response.json({
    settings: {
      ...settings,
      callmebotApiKeySet: !!callmebotApiKey,
      callmebotApiKeyHint: callmebotApiKey ? maskCallmebotKey(callmebotApiKey) : '',
    },
  });
}

export async function PUT(req: NextRequest) {
  const guard = await requirePermission(req, 'settings', 'edit');
  if (guard instanceof Response) return guard;
  const data = await req.json() as Record<string, unknown>;
  // Dipakai langsung sebagai ambang/pengali harga di storefront (gratis ongkir, diskon reseller)
  // — clamp di server juga, bukan cuma di form Pengaturan, supaya panggilan API langsung tidak
  // bisa menyimpan nilai negatif.
  if (data.freeShippingMin !== undefined) data.freeShippingMin = Math.max(0, Number(data.freeShippingMin) || 0);
  if (data.resellerDiscount !== undefined) data.resellerDiscount = Math.max(0, Number(data.resellerDiscount) || 0);
  // Field turunan khusus respons GET — jangan pernah tersimpan.
  delete data.callmebotApiKeySet;
  delete data.callmebotApiKeyHint;
  // Nomor tujuan notifikasi WA: kosong = pakai fallback (env / WhatsApp toko), selain itu wajib valid.
  if (typeof data.notifyPhone === 'string') {
    const phone = data.notifyPhone.trim();
    data.notifyPhone = phone;
    if (!isValidIdMobile(phone)) return Response.json({ error: PHONE_FORMAT_HINT }, { status: 400 });
  }
  // API key: undefined/'' = tidak diubah (klien tidak memegang key lama), null = hapus, selain itu harus valid.
  if (data.callmebotApiKey === undefined || data.callmebotApiKey === '') {
    delete data.callmebotApiKey;
  } else if (data.callmebotApiKey !== null) {
    const key = cleanCallmebotKey(data.callmebotApiKey);
    if (!key) return Response.json({ error: 'API key CallMeBot tidak valid (hanya huruf/angka, 3–64 karakter).' }, { status: 400 });
    data.callmebotApiKey = key;
  }
  await setSettings(data);
  // Nota kirim ke mitra (via WA) di-cache 1 jam per shipment — invalidasi begitu
  // ada perubahan settings (logo/alamat/ttd/dll) supaya tidak menampilkan data basi.
  revalidateTag('settings', 'max');
  revalidateTag(CLOSING_PDF_TAG, { expire: 0 }); // header toko (nama/alamat/logo) ikut tercetak di PDF closing ter-cache
  // Storefront (app terpisah) cache rekening/QRIS & branding sendiri — beri tahu lewat
  // endpoint revalidate-nya juga, sama seperti products/categories/stats. Kita tidak tahu
  // dari sini field mana yang berubah, jadi invalidasi keduanya sekalian (murah, best-effort).
  after(() => {
    revalidateStorefront('payment-info');
    revalidateStorefront('branding');
  });
  return Response.json({ ok: true });
}
