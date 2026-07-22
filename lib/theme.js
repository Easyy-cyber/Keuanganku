export const DARK = {
  bg:        '#000000',
  surface:   '#0A0A0A',
  surfaceUp: '#111111',
  surfaceHi: '#1A1A1A',
  border:    '#222222',
  borderHi:  '#333333',
  textPri:   '#F5F5F5',
  textSec:   '#888888',
  textMuted: '#444444',
  accent:    '#6366F1',
  accentDim: '#1E1B4B',
  income:  { solid:'#34D399', dim:'#052E1A', border:'#064E2E', glow:'rgba(52,211,153,0.15)'  },
  outcome: { solid:'#F87171', dim:'#2D0A0A', border:'#4D1515', glow:'rgba(248,113,113,0.15)' },
  saving:  { solid:'#FBBF24', dim:'#2D1F00', border:'#4D3500', glow:'rgba(251,191,36,0.15)'  },
  asset:   { solid:'#A78BFA', dim:'#1A1030', border:'#2E1B52', glow:'rgba(167,139,250,0.15)' },
}

export const LIGHT = {
  bg:        '#F2F3F7',
  surface:   '#FFFFFF',
  surfaceUp: '#FFFFFF',
  surfaceHi: '#F0F1F5',
  border:    '#E4E6EF',
  borderHi:  '#C8CBE0',
  textPri:   '#111827',
  textSec:   '#6B7280',
  textMuted: '#9CA3AF',
  accent:    '#4F46E5',
  accentDim: '#EEF2FF',
  income:  { solid:'#059669', dim:'#ECFDF5', border:'#D1FAE5', glow:'rgba(5,150,105,0.1)'   },
  outcome: { solid:'#DC2626', dim:'#FEF2F2', border:'#FECACA', glow:'rgba(220,38,38,0.1)'   },
  saving:  { solid:'#D97706', dim:'#FFFBEB', border:'#FDE68A', glow:'rgba(217,119,6,0.1)'   },
  asset:   { solid:'#7C3AED', dim:'#F5F3FF', border:'#DDD6FE', glow:'rgba(124,58,237,0.1)'  },
}

export const getTheme = (isDark) => isDark ? DARK : LIGHT
