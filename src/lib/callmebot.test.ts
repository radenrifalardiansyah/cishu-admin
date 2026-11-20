import { describe, expect, it } from 'vitest';
import { cleanCallmebotKey, maskCallmebotKey } from './callmebot';

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
  it('menyamarkan key dengan hanya 4 digit akhir', () => {
    expect(maskCallmebotKey('1234567890')).toBe('••••7890');
    expect(maskCallmebotKey('123')).toBe('••••');
  });
});
