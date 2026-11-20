import { describe, it, expect } from 'vitest';
import { hexToShades, normalizeHex } from './color';

describe('hexToShades', () => {
  it('menerima hex 6 digit', () => {
    const s = hexToShades('#2563EB');
    expect(s.accent).toBe('#2563EB');
    expect(s.border).toBe('rgba(37,99,235,0.22)');
    expect(s.grad).not.toContain('NaN');
  });

  it('menormalkan hex 3 digit dan mengabaikan huruf besar/kecil', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(hexToShades('#ABC').accent).toBe('#AABBCC');
  });

  it('input tidak valid jatuh ke warna bawaan tanpa NaN', () => {
    for (const bad of ['', 'red', '#12', '#gggggg', '2563EB', '#2563EB00']) {
      const s = hexToShades(bad);
      expect(s.accent).toBe('#2563EB');
      expect(JSON.stringify(s)).not.toContain('NaN');
    }
  });
});
