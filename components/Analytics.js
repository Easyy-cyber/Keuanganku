'use client'
import { useState } from "react";
import { CATS, fmt, fmtShort, getYM, nowYM, ymFull, ymShort, MNS, donutSlicePath } from '@/lib/utils';
import { getTheme } from '@/lib/theme'

/* ─── Donut Chart ─── */
function DonutChart({ segments, size = 180 , D}) {
  const cx = size / 2, cy = size / 2, outerR = 72, innerR = 48;
  const total = segments.reduce((s, d) => s + d.value, 0);
  const [hovered, setHovered] = useState(null);

  if (total === 0) return (
    <div style={{ width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6 }}>
      <i className="ti ti-chart-donut" style={{ fontSize:32, color:D.textMuted }} />
      <span style={{ fontSize:11, color:D.textMuted }}>Belum ada data</span>
    </div>
  );

  let startDeg = 0;
  const slices = segments.filter(s => s.value > 0).map((seg, i) => {
    const deg = (seg.value / total) * 360;
    const midDeg = startDeg + deg / 2;
    const slice = { ...seg, startDeg, endDeg: startDeg + deg, midDeg, index: i };
    startDeg += deg;
    return slice;
  });

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div style={{ position:"relative", width:size, height:size, margin:"0 auto" }}>
      <svg width={size} height={size}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={(outerR+innerR)/2} fill="none" stroke={D.surfaceHi} strokeWidth={outerR-innerR} />
        {slices.map((s, i) => (
          <path
            key={i}
            d={donutSlicePath(cx, cy, outerR + (hovered===i?4:0), innerR - (hovered===i?2:0), s.startDeg, s.endDeg)}
            fill={s.color}
            opacity={hovered !== null && hovered !== i ? 0.4 : 1}
            style={{ cursor:"pointer", transition:"opacity 0.2s, d 0.2s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Center */}
        {hov ? (
          <>
            <text x={cx} y={cy-8} textAnchor="middle" fill={hov.color} fontSize={11} fontWeight="700" fontFamily="Plus Jakarta Sans,sans-serif">{hov.label}</text>
            <text x={cx} y={cy+8} textAnchor="middle" fill={D.textPri} fontSize={12} fontWeight="800" fontFamily="Plus Jakarta Sans,sans-serif">{fmtShort(hov.value)}</text>
            <text x={cx} y={cy+22} textAnchor="middle" fill={D.textMuted} fontSize={10} fontFamily="Plus Jakarta Sans,sans-serif">{((hov.value/total)*100).toFixed(1)}%</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy-4} textAnchor="middle" fill={D.textSec} fontSize={10} fontWeight="600" fontFamily="Plus Jakarta Sans,sans-serif">TOTAL</text>
            <text x={cx} y={cy+12} textAnchor="middle" fill={D.textPri} fontSize={13} fontWeight="800" fontFamily="Plus Jakarta Sans,sans-serif">{fmtShort(total)}</text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ─── Bar Chart (Tren Bulanan) ─── */
function BarChart({ monthlyData, D }) {
  const [hovered, setHovered] = useState(null);
  const maxVal = Math.max(...monthlyData.flatMap(m => [m.income, m.outcome]), 1);
  const barH = 140, barW = 22, groupGap = 14, gap = 4;
  const groupW = barW * 2 + gap;
  const totalW = monthlyData.length * (groupW + groupGap);

  return (
    <div style={{ overflowX:"auto", paddingBottom:4 }}>
      <svg width={Math.max(totalW, 300)} height={barH + 40} style={{ display:"block" }}>
        {/* Grid lines */}
        {[0,0.25,0.5,0.75,1].map((p,i) => (
          <line key={i} x1={0} y1={barH*(1-p)} x2={totalW} y2={barH*(1-p)}
            stroke={D.border} strokeWidth={0.5} strokeDasharray={i===0?"":"4,4"} />
        ))}

        {monthlyData.map((m, gi) => {
          const x = gi * (groupW + groupGap) + groupGap / 2;
          const incomeH  = (m.income  / maxVal) * barH;
          const outcomeH = (m.outcome / maxVal) * barH;
          const isHov    = hovered === gi;
          const hasData  = m.income > 0 || m.outcome > 0;
          const tipX     = Math.min(x - 4, totalW - 112);

          return (
            <g key={gi}>
              {/* Full-height invisible hitbox — hover selalu aktif walau bar kecil */}
              <rect
                x={x - groupGap / 4} y={0}
                width={groupW + groupGap / 2} height={barH + 30}
                fill="transparent" style={{ cursor:"pointer" }}
                onMouseEnter={() => setHovered(gi)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Highlight kolom */}
              {isHov && (
                <rect x={x - groupGap / 4} y={0} width={groupW + groupGap / 2} height={barH}
                  fill="rgba(255,255,255,0.04)" rx={4} style={{ pointerEvents:"none" }} />
              )}

              {/* Income bar */}
              {m.income > 0 && (
                <rect x={x} y={barH - incomeH} width={barW} height={incomeH} rx={4}
                  fill={D.income.solid} opacity={hovered !== null && !isHov ? 0.3 : 1}
                  style={{ pointerEvents:"none" }} />
              )}

              {/* Outcome bar */}
              {m.outcome > 0 && (
                <rect x={x + barW + gap} y={barH - outcomeH} width={barW} height={outcomeH} rx={4}
                  fill={D.outcome.solid} opacity={hovered !== null && !isHov ? 0.3 : 1}
                  style={{ pointerEvents:"none" }} />
              )}

              {/* Month label */}
              <text x={x + groupW / 2} y={barH + 18} textAnchor="middle"
                fill={isHov ? D.textPri : D.textMuted}
                fontSize={10} fontWeight={isHov ? "700" : "500"}
                fontFamily="Plus Jakarta Sans,sans-serif"
                style={{ pointerEvents:"none" }}>
                {m.label}
              </text>

              {/* Tooltip — selalu di atas, tidak pernah ketabrak bar */}
              {isHov && (
                <g style={{ pointerEvents:"none" }}>
                  <rect x={tipX} y={4} width={110} height={hasData ? 54 : 36}
                    rx={8} fill={D.surfaceHi} stroke={D.borderHi} strokeWidth={1} />
                  <text x={tipX + 55} y={18} textAnchor="middle"
                    fill={D.textSec} fontSize={9} fontWeight="700"
                    fontFamily="Plus Jakarta Sans,sans-serif">
                    {m.label}
                  </text>
                  {hasData ? (
                    <>
                      <text x={tipX + 55} y={33} textAnchor="middle"
                        fill={D.income.solid} fontSize={9} fontWeight="700"
                        fontFamily="Plus Jakarta Sans,sans-serif">
                        ▲ {fmtShort(m.income)}
                      </text>
                      <text x={tipX + 55} y={48} textAnchor="middle"
                        fill={D.outcome.solid} fontSize={9} fontWeight="700"
                        fontFamily="Plus Jakarta Sans,sans-serif">
                        ▼ {fmtShort(m.outcome)}
                      </text>
                    </>
                  ) : (
                    <text x={tipX + 55} y={38} textAnchor="middle"
                      fill={D.textMuted} fontSize={9}
                      fontFamily="Plus Jakarta Sans,sans-serif">
                      Tidak ada data
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:6 }}>
        {[{color:D.income.solid,label:"Pemasukan"},{color:D.outcome.solid,label:"Pengeluaran"}].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:D.textSec }}>
            <div style={{ width:10, height:10, borderRadius:3, background:l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section Card ─── */
function Section({ title, icon, children, D }) {
  return (
    <div style={{ background:D.surfaceUp, borderRadius:18, padding:"18px 20px", border:`1.5px solid ${D.border}`, marginBottom:14 }}>
      <p style={{ margin:"0 0 16px", fontSize:14, fontWeight:800, color:D.textPri, display:"flex", alignItems:"center", gap:8 }}>
        <i className={`ti ${icon}`} style={{ fontSize:16, color:D.accent }} />
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Analytics Page ─── */
export default function Analytics({ txs, isDark }) {
  const D = getTheme(isDark)
  const [month, setMonth] = useState(nowYM());

  const months = [...new Set([nowYM(), ...txs.map(t => getYM(t.date))])].sort((a,b) => b.localeCompare(a));
  const filtered = txs.filter(t => getYM(t.date) === month);
  const sum = filtered.reduce((a,t) => ({ ...a, [t.category]:(a[t.category]||0)+t.amount }), {});
  const income = sum.income||0, outcome = sum.outcome||0;

  /* Tabungan & Aset akumulatif sampai bulan yang dipilih */
  const cumulativeUpTo = (cat) => txs
    .filter(t => t.category === cat && getYM(t.date) <= month)
    .reduce((s, t) => s + t.amount, 0);
  const saving = cumulativeUpTo("saving");
  const asset  = cumulativeUpTo("asset");
  const spendPct = income > 0 ? Math.min((outcome / income) * 100, 100) : 0;
  const savePct  = income > 0 ? Math.min((saving  / income) * 100, 100) : 0;

  /* Last 6 months for bar chart */
  const last6 = Array.from({ length:6 }, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5-i));
    const ym = getYM(d.toISOString());
    const mTxs = txs.filter(t => getYM(t.date) === ym);
    const mSum = mTxs.reduce((a,t) => ({ ...a, [t.category]:(a[t.category]||0)+t.amount }), {});
    return { label: MNS[d.getMonth()], income: mSum.income||0, outcome: mSum.outcome||0 };
  });

  /* Donut segments */
  const donutData = Object.entries(CATS).map(([key,c]) => ({
    label: c.label, value: sum[key]||0, color: c.solid,
  })).filter(s => s.value > 0);

  return (
    <div style={{ minHeight:"100vh", background:D.bg }}>
      {/* Header */}
      <div style={{ background:"rgba(13,15,26,0.9)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${D.border}`, padding:"14px 20px", position:"sticky", top:0, zIndex:10 }}>
        <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:D.textPri, display:"flex", alignItems:"center", gap:8 }}>
          <i className="ti ti-chart-bar" style={{ fontSize:18, color:D.accent }} />Analitik
        </h1>
        <p style={{ margin:"2px 0 0", fontSize:11, color:D.textMuted }}>Ringkasan & tren keuanganmu</p>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"20px 16px 24px" }}>
        {/* Month Pills */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:4, marginBottom:16, scrollbarWidth:"none" }}>
          {months.map(m => {
            const active = month === m;
            return (
              <button key={m} onClick={() => setMonth(m)} style={{
                flexShrink:0, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700,
                background: active?D.accent:D.surfaceUp, color:active?"#0D0F1A":D.textSec,
                border:active?"none":`1.5px solid ${D.border}`, transition:"all 0.15s",
                boxShadow:active?"0 0 14px rgba(129,140,248,0.35)":"none",
              }}>
                {ymShort(m)}
              </button>
            );
          })}
        </div>

        {/* 1. Spending percentage */}
        <Section title={`Ringkasan · ${ymFull(month)}`} icon="ti-report-analytics" D={D}>
          {income === 0 ? (
            <p style={{ margin:0, fontSize:13, color:D.textMuted, textAlign:"center", padding:"12px 0" }}>Belum ada pemasukan di bulan ini.</p>
          ) : (
            <>
              {/* Spend ratio */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:D.textSec, fontWeight:600 }}>Pengeluaran dari Pemasukan</span>
                  <span style={{ fontSize:12, fontWeight:800, color: spendPct>80?D.outcome.solid:spendPct>50?D.saving.solid:D.income.solid }}>
                    {spendPct.toFixed(1)}%
                  </span>
                </div>
                <div style={{ height:10, background:D.surfaceHi, borderRadius:20, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${spendPct}%`, borderRadius:20, transition:"width 0.5s", background: spendPct>80?D.outcome.solid:spendPct>50?D.saving.solid:D.income.solid }} />
                </div>
                <p style={{ margin:"6px 0 0", fontSize:11, color:D.textMuted }}>
                  {spendPct > 80 ? "⚠️ Pengeluaran terlalu tinggi! Coba kurangi." : spendPct > 50 ? "🟡 Pengeluaran cukup tinggi, perhatikan budget." : "✅ Pengeluaran terkontrol dengan baik!"}
                </p>
              </div>

              {/* Save ratio */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:D.textSec, fontWeight:600 }}>Tabungan dari Pemasukan</span>
                  <span style={{ fontSize:12, fontWeight:800, color:D.saving.solid }}>{savePct.toFixed(1)}%</span>
                </div>
                <div style={{ height:10, background:D.surfaceHi, borderRadius:20, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${savePct}%`, borderRadius:20, background:D.saving.solid, transition:"width 0.5s" }} />
                </div>
                <p style={{ margin:"6px 0 0", fontSize:11, color:D.textMuted }}>
                  {savePct >= 20 ? "🏆 Luar biasa! Kamu menabung ≥20% dari pemasukan." : savePct >= 10 ? "👍 Bagus, coba targetkan 20% tabungan." : "💡 Idealnya tabung minimal 10–20% dari pemasukan."}
                </p>
              </div>

              {/* Summary row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:14 }}>
                {[
                  { label:"Pemasukan", value:income,  color:D.income.solid  },
                  { label:"Keluar",    value:outcome, color:D.outcome.solid },
                  { label:"Sisa",      value:income-outcome, color:(income-outcome)>=0?D.income.solid:D.outcome.solid },
                ].map(r => (
                  <div key={r.label} style={{ background:D.surfaceHi, borderRadius:10, padding:"10px 12px" }}>
                    <p style={{ margin:"0 0 3px", fontSize:10, color:D.textMuted, fontWeight:600, textTransform:"uppercase" }}>{r.label}</p>
                    <p style={{ margin:0, fontSize:13, fontWeight:800, color:r.color }}>{fmtShort(r.value)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* 2. Distribusi Donut */}
        <Section title="Distribusi per Kategori" icon="ti-chart-donut">
          <DonutChart segments={donutData} size={180} D={D} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:16 }}>
            {Object.entries(CATS).map(([key,c]) => {
              const val = sum[key]||0;
              const pct = (income+outcome+saving+asset) > 0 ? ((val/(income+outcome+saving+asset))*100).toFixed(1) : 0;
              return (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", background:D.surfaceHi, borderRadius:10 }}>
                  <div style={{ width:8, height:32, borderRadius:4, background:c.solid, flexShrink:0 }} />
                  <div>
                    <p style={{ margin:0, fontSize:11, color:D.textSec, fontWeight:600 }}>{c.label}</p>
                    <p style={{ margin:0, fontSize:13, fontWeight:800, color:c.solid }}>{fmtShort(val)}</p>
                    <p style={{ margin:0, fontSize:10, color:D.textMuted }}>{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 3. Tren 6 Bulan */}
        <Section title="Tren 6 Bulan Terakhir" icon="ti-trending-up">
          <BarChart monthlyData={last6} D={D} />
        </Section>
      </div>
    </div>
  );
}
