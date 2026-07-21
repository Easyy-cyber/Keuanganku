/* ─── Shared Theme Tokens ─── */
export const DARK = {
  bg:       '#000000',
  surface:  '#0D0D0D',
  surfaceUp:'#141414',
  surfaceHi:'#1C1C1C',
  border:   '#2A2A2A',
  borderHi: '#3A3A3A',
  textPri:  '#FFFFFF',
  textSec:  '#888888',
  textMuted:'#444444',
  accent:   '#818CF8',
  accentDim:'#1E2148',
  income:  { solid:'#34D399', dim:'#0D2E22', border:'#1A5C40', glow:'rgba(52,211,153,0.2)'  },
  outcome: { solid:'#FB7185', dim:'#2E0D16', border:'#5C1A26', glow:'rgba(251,113,133,0.2)' },
  saving:  { solid:'#FBBF24', dim:'#2E2105', border:'#5C400A', glow:'rgba(251,191,36,0.2)'  },
  asset:   { solid:'#A78BFA', dim:'#1E1240', border:'#3D2480', glow:'rgba(167,139,250,0.2)' },
}

export const LIGHT = {
  bg:       '#F0F2FF',
  surface:  '#FFFFFF',
  surfaceUp:'#F8F9FF',
  surfaceHi:'#ECEEFF',
  border:   '#DDDFF0',
  borderHi: '#C8CAEE',
  textPri:  '#111122',
  textSec:  '#555577',
  textMuted:'#9999BB',
  accent:   '#4F46E5',
  accentDim:'#EEF0FF',
  income:  { solid:'#059669', dim:'#ECFDF5', border:'#A7F3D0', glow:'rgba(5,150,105,0.15)'   },
  outcome: { solid:'#E11D48', dim:'#FFF1F2', border:'#FECDD3', glow:'rgba(225,29,72,0.15)'   },
  saving:  { solid:'#D97706', dim:'#FFFBEB', border:'#FDE68A', glow:'rgba(217,119,6,0.15)'   },
  asset:   { solid:'#7C3AED', dim:'#F5F3FF', border:'#DDD6FE', glow:'rgba(124,58,237,0.15)'  },
}

export const getTheme = (isDark) => isDark ? DARK : LIGHT
