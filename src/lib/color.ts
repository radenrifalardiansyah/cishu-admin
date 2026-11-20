function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Derives the darker/lighter/near-white tint variants an accent color needs
// (--accent-dark/--accent-light/--accent-bg di globals.css) plus gradient tombol primer dan
// border tint, dari satu hex dasar, supaya warna tema pilihan admin tetap satu keluarga.
// Saturasi dipertahankan penuh agar tint tidak keabu-abuan.
const FALLBACK_HEX = '#2563EB';

// Terima '#abc' atau '#aabbcc' (tanpa memperhatikan huruf besar/kecil); selain itu pakai warna bawaan
// supaya CSS variable tema tidak pernah berisi NaN.
export function normalizeHex(input: string): string {
  const v = (input ?? '').trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map(c => c + c).join('');
  return FALLBACK_HEX;
}

export function hexToShades(input: string) {
  const hex = normalizeHex(input);
  const [h, s, l] = hexToHsl(hex);
  // Gradient bergeser ~12 derajat ke arah cyan supaya tombol terasa hidup; ujung gelapnya
  // tetap >= 4,5:1 dengan teks putih untuk warna dasar yang cukup pekat.
  const hCyan = (h - 12 + 360) % 360;
  const dark = hslToHex(h, clamp01(s), clamp01(l * 0.88));
  const m = hex.replace('#', '');
  const rgb = [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16)).join(',');
  return {
    accent: hex,
    dark,
    light: hslToHex(h, clamp01(s), clamp01(l + (1 - l) * 0.76)),
    bg: hslToHex(h, clamp01(s), clamp01(l + (1 - l) * 0.94)),
    grad: `linear-gradient(135deg, ${hex}, ${hslToHex(hCyan, clamp01(s), clamp01(l * 0.82))})`,
    gradHover: `linear-gradient(135deg, ${dark}, ${hslToHex(hCyan, clamp01(s), clamp01(l * 0.7))})`,
    border: `rgba(${rgb},0.22)`,
  };
}
