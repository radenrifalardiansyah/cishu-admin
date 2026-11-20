import { describe, it, expect } from 'vitest';
import { hexToShades, normalizeHex, isLegacyWarmColor } from './color';

describe('hexToShades', () => {
  it('menerima hex 6 digit', () => {
    const s = hexToShades('#C93C55');
    expect(s.accent).toBe('#C93C55');
    expect(s.border).toBe('rgba(201,60,85,0.22)');
    expect(s.grad).not.toContain('NaN');
  });

  it('menormalkan hex 3 digit dan mengabaikan huruf besar/kecil', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(hexToShades('#ABC').accent).toBe('#AABBCC');
  });

  it('input tidak valid jatuh ke warna bawaan tanpa NaN', () => {
    for (const bad of ['', 'red', '#12', '#gggggg', 'C93C55', '#C93C5500']) {
      const s = hexToShades(bad);
      expect(s.accent).toBe('#C93C55');
      expect(JSON.stringify(s)).not.toContain('NaN');
    }
  });
});

describe('isLegacyWarmColor', () => {
  it('mengenali sisa tema oranye/cokelat lama', () => {
    for (const c of ['#D4691E', '#C96018', '#A84F10', '#E8821A', '#1C1917', '#d4691e']) expect(isLegacyWarmColor(c)).toBe(true);
  });
  it('tidak menandai biru, hijau, atau nilai tak valid', () => {
    for (const c of ['#C93C55', '#0E7490', '#15803D', '#7C3AED', '', 'red']) expect(isLegacyWarmColor(c)).toBe(false);
  });
});
