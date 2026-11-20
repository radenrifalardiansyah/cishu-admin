import { afterEach, describe, expect, it, vi } from 'vitest';
import { callmebotReplyOk, cleanCallmebotKey, maskCallmebotKey, sendCallmebot } from './callmebot';

describe('callmebot', () => {
  it('menerima key token biasa dan memangkas spasi', () => {
    expect(cleanCallmebotKey(' 1234567 ')).toBe('1234567');
    expect(cleanCallmebotKey('abc_DEF-123')).toBe('abc_DEF-123');
  });
  it('menolak key kosong, terlalu pendek/panjang, atau berisi karakter berbahaya', () => {
    expect(cleanCallmebotKey('')).toBeNull();
    expect(cleanCallmebotKey('ab')).toBeNull();
    expect(cleanCallmebotKey('a'.repeat(65))).toBeNull();
    expect(cleanCallmebotKey('123&phone=1')).toBeNull();
    expect(cleanCallmebotKey(null)).toBeNull();
  });
  it('menyamarkan key: key pendek tanpa petunjuk, key panjang hanya 2 karakter akhir', () => {
    expect(maskCallmebotKey('1234567')).toBe('••••');
    expect(maskCallmebotKey('123')).toBe('••••');
    expect(maskCallmebotKey('1234567890')).toBe('••••90');
    expect(maskCallmebotKey('1234567')).not.toContain('67');
  });
});

describe('callmebotReplyOk', () => {
  it('sukses bila 2xx dan isi tidak memuat penanda penolakan', () => {
    expect(callmebotReplyOk(200, 'Message queued. You will receive it in a few seconds.')).toBe(true);
    expect(callmebotReplyOk(200, '')).toBe(true);
  });
  it('gagal bila status bukan 2xx', () => {
    expect(callmebotReplyOk(401, 'Message queued')).toBe(false);
    expect(callmebotReplyOk(500, '')).toBe(false);
  });
  it('gagal bila status 2xx tetapi isi menolak', () => {
    expect(callmebotReplyOk(200, 'APIKey is invalid.')).toBe(false);
    expect(callmebotReplyOk(200, 'Error: phone number not authorized')).toBe(false);
    expect(callmebotReplyOk(200, 'Too many requests, blocked')).toBe(false);
  });
});

describe('sendCallmebot', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  const stubFetch = (status: number, body: string) =>
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status })));

  it('meng-encode nomor, teks, dan key di URL', async () => {
    stubFetch(200, 'Message queued');
    await sendCallmebot('0812-3456-7890', 'abc_DEF-123', '*Tes* & spasi+plus\nbaris');
    const url = String((vi.mocked(fetch).mock.calls[0] as unknown[])[0]);
    expect(url.startsWith('https://api.callmebot.com/whatsapp.php?')).toBe(true);
    expect(url).toContain('apikey=abc_DEF-123');
    expect(url).toContain('text=' + encodeURIComponent('*Tes* & spasi+plus\nbaris'));
    expect(new URL(url).searchParams.get('text')).toBe('*Tes* & spasi+plus\nbaris');
    expect(new URL(url).searchParams.get('phone')).toMatch(/^\d+$/);
  });
  it('melaporkan sukses dan membersihkan tag HTML dari balasan', async () => {
    stubFetch(200, '<html><b>Message queued.</b></html>');
    const r = await sendCallmebot('081234567890', 'abc123', 'halo');
    expect(r).toEqual({ ok: true, detail: 'Message queued.' });
  });
  it('melaporkan gagal bila 2xx tetapi balasan menolak (key salah)', async () => {
    stubFetch(200, 'APIKey is invalid or phone not activated');
    const r = await sendCallmebot('081234567890', 'salah', 'halo');
    expect(r.ok).toBe(false);
    expect(r.detail).toContain('invalid');
  });
  it('melaporkan gagal bila status non-2xx', async () => {
    stubFetch(503, 'Service Unavailable');
    expect((await sendCallmebot('081234567890', 'abc123', 'halo')).ok).toBe(false);
  });
  it('melaporkan gagal tanpa membocorkan key saat fetch gagal/timeout', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('connect ETIMEDOUT api.callmebot.com'); }));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await sendCallmebot('081234567890', 'rahasia123', 'halo');
    expect(r.ok).toBe(false);
    expect(r.detail).not.toContain('rahasia123');
    expect(JSON.stringify(errSpy.mock.calls)).not.toContain('rahasia123');
  });
});
