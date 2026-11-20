import { describe, it, expect } from 'vitest';
import { hexToShades, normalizeHex, isLegacyWarmColor } from './color';

describe('hexToShades', () => {
  it('menerima hex 6 digit', () => {
    const s = hexToShades('#1D6FC4');
    expect(s.accent).toBe('#1D6FC4');
    expect(s.border).toBe('rgba(29,111,196,0.22)');
    expect(s.grad).not.toContain('NaN');
  });

  it('menormalkan hex 3 digit dan mengabaikan huruf besar/kecil', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(hexToShades('#ABC').accent).toBe('#AABBCC');
  });

  it('input tidak valid jatuh ke warna bawaan tanpa NaN', () => {
    for (const bad of ['', 'red', '#12', '#gggggg', '1D6FC4', '#1D6FC400']) {
      const s = hexToShades(bad);
      expect(s.accent).toBe('#1D6FC4');
      expect(JSON.stringify(s)).not.toContain('NaN');
    }
  });
});

describe('isLegacyWarmColor', () => {
  it('mengenali sisa tema oranye/cokelat lama', () => {
    for (const c of ['#D4691E', '#C96018', '#A84F10', '#E8821A', '#1C1917', '#d4691e']) expect(isLegacyWarmColor(c)).toBe(true);
  });
  it('tidak menandai biru, hijau, atau nilai tak valid', () => {
    for (const c of ['#1D6FC4', '#0E7490', '#15803D', '#7C3AED', '', 'red']) expect(isLegacyWarmColor(c)).toBe(false);
  });
});
