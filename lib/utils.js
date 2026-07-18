/* ─── Design Tokens ─── */
export const D = {
  bg:        "#0D0F1A",
  surface:   "#131525",
  surfaceUp: "#1A1D30",
  surfaceHi: "#20243A",
  border:    "#252840",
  borderHi:  "#323660",
  textPri:   "#EEF0FF",
  textSec:   "#7B7FA0",
  textMuted: "#434668",
  accent:    "#818CF8",
  accentDim: "#1E2148",
  income:  { solid:"#34D399", dim:"#0D2E22", border:"#1A5C40", glow:"rgba(52,211,153,0.2)"  },
  outcome: { solid:"#FB7185", dim:"#2E0D16", border:"#5C1A26", glow:"rgba(251,113,133,0.2)" },
  saving:  { solid:"#FBBF24", dim:"#2E2105", border:"#5C400A", glow:"rgba(251,191,36,0.2)"  },
  asset:   { solid:"#A78BFA", dim:"#1E1240", border:"#3D2480", glow:"rgba(167,139,250,0.2)" },
};

/* ─── Categories ─── */
export const CATS = {
  income:  { label:"Pemasukan",   icon:"ti-trending-up",   ...D.income  },
  outcome: { label:"Pengeluaran", icon:"ti-trending-down", ...D.outcome },
  saving:  { label:"Tabungan",    icon:"ti-coin",          ...D.saving  },
  asset:   { label:"Aset",        icon:"ti-briefcase",     ...D.asset   },
};

/* ─── Month Names ─── */
export const MN  = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
export const MNS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];

/* ─── Formatters ─── */
export const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", minimumFractionDigits:0 }).format(n);

export const fmtShort = (n) => {
  const abs = Math.abs(n), sign = n < 0 ? "−" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs/1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)     return `${sign}Rp ${(abs/1_000_000).toFixed(1)}Jt`;
  return fmt(n);
};

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });

export const getYM   = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
export const nowYM   = ()    => getYM(new Date().toISOString());
export const ymFull  = (ym)  => { const [y,m] = ym.split("-"); return `${MN[+m-1]} ${y}`; };
export const ymShort = (ym)  => { const [y,m] = ym.split("-"); return `${MNS[+m-1]} ${y}`; };

/* ─── SVG Donut Chart Helper ─── */
export function polarToXY(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function donutSlicePath(cx, cy, outerR, innerR, startDeg, endDeg) {
  const delta = endDeg - startDeg;
  if (delta >= 360) { endDeg = startDeg + 359.9; }
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  const [ox1, oy1] = polarToXY(cx, cy, outerR, startDeg);
  const [ox2, oy2] = polarToXY(cx, cy, outerR, endDeg);
  const [ix1, iy1] = polarToXY(cx, cy, innerR, endDeg);
  const [ix2, iy2] = polarToXY(cx, cy, innerR, startDeg);
  return `M${ox1},${oy1} A${outerR},${outerR} 0 ${large} 1 ${ox2},${oy2} L${ix1},${iy1} A${innerR},${innerR} 0 ${large} 0 ${ix2},${iy2}Z`;
}
