// Sparkline mini (SVG murni, tanpa dependency): bentuk tren sekilas, bukan alat baca angka.
// Dekoratif untuk pembaca layar (aria-hidden) — angka sebenarnya selalu tampil di teks kartu.
export default function Sparkline({ values, color, height = 28, fill = true, strokeWidth = 2 }: {
  values: number[]; color: string; height?: number; fill?: boolean; strokeWidth?: number;
}) {
  if (values.length < 2) return null;
  const W = 100, pad = 2;
  const min = Math.min(...values), max = Math.max(...values), span = max - min;
  const x = (i: number) => (i / (values.length - 1)) * W;
  const y = (v: number) => span === 0 ? height / 2 : pad + (1 - (v - min) / span) * (height - pad * 2);
  const pts = values.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`);
  const line = `M${pts.join(' L')}`;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={`${line} L${W},${height} L0,${height} Z`} fill={color} opacity={0.14} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
