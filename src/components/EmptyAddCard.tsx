'use client';

import { Plus } from 'lucide-react';

// Tampilan standar "daftar masih kosong" untuk semua menu: kartu garis putus-putus dengan tanda
// plus saja. Bila `onClick` diberikan kartu menjadi tombol tambah (label/hint hanya aria-label dan
// tooltip). Bila TIDAK (user tanpa hak tambah / data dibuat dari menu lain) kartu tidak bisa diklik
// dan menampilkan teks kecil penjelasnya, supaya pengguna tahu kenapa tidak ada aksi.
// Petunjuk standar untuk kartu non-klik karena pengguna tidak berhak menambah data.
export const NO_CREATE_HINT = 'Anda tidak punya izin menambah data di menu ini.';

export default function EmptyAddCard({ label, onClick, hint, minHeight = 200 }: {
  label: string; onClick?: () => void; hint?: string; minHeight?: number;
}) {
  const clickable = !!onClick;
  const style: React.CSSProperties = { border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', minHeight };
  const hover = (on: boolean) => (e: React.MouseEvent<HTMLElement>) => {
    if (!clickable) return;
    const el = e.currentTarget;
    el.style.background = on ? 'var(--surface-2)' : 'transparent';
    el.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
    el.style.color = on ? 'var(--accent)' : 'var(--text-muted)';
  };
  const accessible = hint ? `${label}. ${hint}` : label;
  // Teks penjelas untuk kartu non-klik: label (kecuali berupa ajakan aksi seperti "Tambah X" yang
  // menyesatkan di kartu yang tidak bisa diklik) ditambah hint bila ada dan berbeda dari label.
  const ACTION_LABEL = /^(tambah|catat|buat|kirim|terima)\b/i;
  const labelLine = ACTION_LABEL.test(label) ? '' : label;
  const hintLine = hint && hint !== labelLine ? hint : '';
  const silent = !labelLine && !hintLine; // tanpa teks terlihat: beri alternatif teks untuk pembaca layar
  const content = (
    <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
      <Plus size={26} aria-hidden="true" />
    </div>
  );
  const cls = 'w-full rounded-3xl flex flex-col items-center justify-center p-8 transition-colors';
  return clickable
    ? <button type="button" onClick={onClick} className={cls} style={style} aria-label={accessible} title={label} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>{content}</button>
    : (
      <div className={`${cls} gap-3`} style={style} {...(silent ? { role: 'img', 'aria-label': accessible, title: label } : {})}>
        {content}
        {labelLine && <p className="text-xs font-semibold text-center max-w-md">{labelLine}</p>}
        {hintLine && <p className="text-xs font-medium text-center max-w-md">{hintLine}</p>}
      </div>
    );
}
