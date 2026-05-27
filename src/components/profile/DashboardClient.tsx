'use client';

// ConjuGap — Dashboard (client component)
// Fetches /api/profile and renders the full dashboard screen.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { getLevelInfo, LEVEL_KEYS } from '@/lib/xpSystem';

// ── API types ─────────────────────────────────────────────────────────────────

interface ProfileData {
  user: {
    name:             string | null;
    email:            string | null;
    image:            string | null;
    currentStreak:    number;
    longestStreak:    number;
    lastPracticeDate: string | null;
    createdAt:        string;
  };
  stats: {
    totalCorrect:          number;
    totalIncorrect:        number;
    totalAnswered:         number;
    overallAccuracy:       number;
    avgSecondsPerQuestion: number;
  };
  tenseBreakdown: Array<{
    tense:    string;
    correct:  number;
    incorrect:number;
    accuracy: number;
  }>;
  weakSpots: Array<{
    verbInfinitive: string;
    pronoun:        string;
    tense:          string;
    correct:        number;
    incorrect:      number;
    accuracy:       number;
  }>;
  heatmap: Array<{
    date:         string;
    sessionCount: number;
    totalMinutes: number;
  }>;
  weeklyMinutes: Array<{
    dayIndex: number;
    minutes:  number;
  }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TENSE_LABELS: Record<string, string> = {
  pres: 'Presente',
  pi:   'Pretérito Indefinido',
  imp:  'Imperfecto',
  pp:   'Pretérito Perfecto',
  fut:  'Futuro Simple',
  cond: 'Condicional',
  sub:  'Subjuntivo Presente',
  subp: 'Subjuntivo Imperfecto',
};

function tenseLabel(t: string) {
  return TENSE_LABELS[t] ?? t;
}

function heatIntensity(mins: number): number {
  if (mins === 0) return 0;
  if (mins < 5)  return 1;
  if (mins < 15) return 2;
  if (mins < 30) return 3;
  return 4;
}

function buildHeatGrid(raw: ProfileData['heatmap']): number[] {
  const map = new Map(raw.map(r => [r.date, r.totalMinutes]));
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 89);
  const dow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dow);

  const cells: number[] = [];
  const cur = new Date(start);
  const end = new Date(today);
  end.setDate(today.getDate() + (6 - (today.getDay() + 6) % 7));

  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    cells.push(heatIntensity(map.get(key) ?? 0));
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function tenseColor(pct: number): string {
  if (pct >= 80) return '#7AB89B';
  if (pct >= 60) return '#F5B948';
  return '#C2456E';
}

function weakColors(acc: number): { bg: string; color: string } {
  if (acc < 50)  return { bg: '#FBE6EC', color: '#8C2A4D' };
  if (acc < 65)  return { bg: '#FEF7E3', color: '#A8761A' };
  return { bg: '#E8F5EE', color: '#1F6B45' };
}

const DAY_LABELS  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const HEAT_COLORS = ['#ECE2D5', '#F9D97A', '#F5B948', '#EC7450', '#E8623D'];

// ── Sub-components ────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#FFFCF7', stroke = 2.5 }: { data: number[]; color?: string; stroke?: number }) {
  if (!data.length) return null;
  const W = 200, H = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(0.001, max - min);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  const lastY = H - ((data[data.length - 1] - min) / range) * (H - 6) - 3;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 36 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={W - 2} cy={lastY} r={3.5} fill={color} />
    </svg>
  );
}

function Ring({ pct, color = '#2A1F1A', track = 'rgba(42,31,26,0.16)', size = 88, stroke = 8 }: {
  pct: number; color?: string; track?: string; size?: number; stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (c * pct) / 100;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
    </svg>
  );
}

function SkeletonBlock({ w = '100%', h = 20, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #ECE2D5 25%, #E2D5C5 50%, #ECE2D5 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ background: '#FBF4E6', minHeight: '90vh', padding: '40px 24px 120px' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ background: '#2A1F1A', borderRadius: 28, padding: 28, height: 160 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[0,1,2,3].map(i => <SkeletonBlock key={i} h={152} r={20} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <SkeletonBlock h={200} r={20} />
          <SkeletonBlock h={200} r={20} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <SkeletonBlock h={260} r={20} />
          <SkeletonBlock h={260} r={20} />
        </div>
      </div>
    </div>
  );
}

// ── Hover helper ─────────────────────────────────────────────────────────────

function useHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({ onPractice }: { onPractice?: () => void }) {
  const router   = useRouter();
  const t        = useTranslations('dashboard');
  const tLevels  = useTranslations('levels');

  const [data,    setData]    = useState<ProfileData | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Practice settings (local only)
  const [reminderOn, setReminderOn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const s = localStorage.getItem('cg_reminder');
    return s === null ? true : s !== 'false';
  });
  const [soundOn,    setSoundOn]    = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('cg_sound');
    return stored === null ? true : stored !== 'false';
  });
  const [hardMode,   setHardMode]   = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const s = localStorage.getItem('cg_hard');
    return s === null ? false : s === 'true';
  });
  const [autoNext,   setAutoNext]   = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const s = localStorage.getItem('cg_autonext');
    return s === null ? true : s !== 'false';
  });

  const handlePractice = () => { onPractice ? onPractice() : router.push('/practice'); };

  const hover1 = useHover();
  const hover2 = useHover();
  const hover3 = useHover();
  const hover4 = useHover();

  useEffect(() => {
    fetch('/api/profile')
      .then(async res => {
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: '#FBF4E6' }}>
      <i className="ph-fill ph-warning-circle" style={{ fontSize: 48, color: '#C2456E' }} />
      <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700, color: '#2A1F1A' }}>
        {t('error_title')}
      </p>
      <p style={{ color: '#7A6A60', fontSize: 14 }}>{error}</p>
      <Button variant="primary" size="md" onClick={() => window.location.reload()}>{t('error_retry')}</Button>
    </div>
  );

  const { user, stats, tenseBreakdown, weakSpots, heatmap, weeklyMinutes } = data;
  const initial  = (user.name ?? user.email ?? '?')[0].toUpperCase();
  const lvlInfo  = getLevelInfo(stats.totalCorrect);
  const levelPct = Math.round(lvlInfo.progress * 100);
  const heatGrid = buildHeatGrid(heatmap);

  const weekBars   = DAY_LABELS.map((day, i) => ({ day, mins: weeklyMinutes.find(w => w.dayIndex === i)?.minutes ?? 0 }));
  const weekTotal  = weekBars.reduce((s, w) => s + w.mins, 0);
  const barMax     = Math.max(...weekBars.map(w => w.mins), 1);
  const activeDays = heatGrid.filter(v => v > 0).length;

  const coloredTenses = tenseBreakdown.map(tb => ({ ...tb, label: tenseLabel(tb.tense), color: tenseColor(tb.accuracy) }));
  const joinedDate    = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const s = {
    outer:       { background: '#FBF4E6', minHeight: '90vh', padding: '40px 24px 120px', position: 'relative' as const, overflow: 'hidden' as const },
    glow:        { position: 'absolute' as const, top: 0, left: 0, right: 0, height: 360, background: 'radial-gradient(900px 360px at 20% 0%, #FFE6BD 0%, transparent 60%)', pointerEvents: 'none' as const },
    inner:       { maxWidth: 1120, margin: '0 auto', position: 'relative' as const, display: 'flex', flexDirection: 'column' as const, gap: 24 },
    identity:    { background: '#2A1F1A', color: '#FFFCF7', borderRadius: 28, padding: 28, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center', boxShadow: '0 6px 0 #1a0f0a', position: 'relative' as const, overflow: 'hidden' as const },
    avatarRing:  { position: 'relative' as const, width: 110, height: 110 },
    avatar:      { width: 88, height: 88, borderRadius: '50%', background: '#E8623D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 36, fontWeight: 700, color: '#FFFCF7', position: 'absolute' as const, top: 11, left: 11, border: '3px solid #2A1F1A' },
    levelChip:   { position: 'absolute' as const, bottom: -6, right: -6, background: '#F5B948', color: '#2A1F1A', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 999, border: '2px solid #2A1F1A', fontFamily: "'JetBrains Mono', monospace" },
    idName:      { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 },
    idTitle:     { fontSize: 13, fontWeight: 700, color: '#F7CB5B', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginTop: 4 },
    idMeta:      { display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' as const },
    metaChip:    { background: 'rgba(255,252,247,0.08)', border: '1px solid rgba(255,252,247,0.16)', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#FFFCF7', display: 'inline-flex', alignItems: 'center', gap: 6 },
    idActions:   { display: 'flex', flexDirection: 'column' as const, gap: 8, alignItems: 'flex-end' as const },
    sectionHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 4px 0' },
    sectionTitle:{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: '#2A1F1A', margin: 0 },
    sectionMore: { fontSize: 12, color: '#7A6A60', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', cursor: 'pointer' },
    statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
    statCard:    { padding: 18, borderRadius: 20, border: '2px solid #2A1F1A', boxShadow: '0 4px 0 #2A1F1A', display: 'flex', flexDirection: 'column' as const, gap: 8, minHeight: 152, position: 'relative' as const, overflow: 'hidden' as const },
    statHead:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    statLab:     { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
    statNum:     { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 },
    statUnit:    { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, opacity: 0.8 },
    statTrend:   { fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 },
    twoCol:      { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 },
    panel:       { background: '#FFFBF1', border: '2px solid #2A1F1A', borderRadius: 20, padding: 20, boxShadow: '0 4px 0 #2A1F1A', display: 'flex', flexDirection: 'column' as const, gap: 14 },
    heatGrid:    { display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(heatGrid.length / 7)}, 1fr)`, gridAutoRows: '14px', gap: 4 },
    heatCell:    { borderRadius: 3, cursor: 'default' },
    heatLegend:  { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, fontSize: 11, color: '#7A6A60', fontWeight: 700 },
    chartBars:   { display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' },
    bar:         { flex: 1, position: 'relative' as const, borderRadius: '6px 6px 2px 2px', background: 'linear-gradient(180deg, #E8623D, #F5B948)', minHeight: 4, display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end' as const },
    barLabel:    { position: 'absolute' as const, bottom: -22, left: 0, right: 0, textAlign: 'center' as const, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#7A6A60', fontWeight: 700 },
    barValue:    { position: 'absolute' as const, top: -18, left: 0, right: 0, textAlign: 'center' as const, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#2A1F1A', fontWeight: 700 },
    tenseRow:    { display: 'grid', gridTemplateColumns: '160px 1fr 60px', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px dashed rgba(42,31,26,0.08)' },
    tenseLabel:  { fontWeight: 700, color: '#2A1F1A', fontSize: 14 },
    tenseTrack:  { height: 12, background: '#ECE2D5', borderRadius: 999, overflow: 'hidden' as const },
    tenseFill:   { height: '100%', borderRadius: 999 },
    tenseValue:  { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#2A1F1A', fontSize: 14, textAlign: 'right' as const },
    weakRow:     { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px dashed rgba(42,31,26,0.08)' },
    weakIcon:    { width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, flexShrink: 0 },
    weakBody:    { flex: 1, display: 'flex', flexDirection: 'column' as const },
    weakVerb:    { fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: '#2A1F1A' },
    weakMeta:    { fontSize: 12, color: '#7A6A60', fontWeight: 600 },
    settingRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(42,31,26,0.06)' },
    settingTitle:{ fontSize: 14, fontWeight: 700, color: '#2A1F1A' },
    settingSub:  { fontSize: 12, color: '#7A6A60', fontWeight: 600, marginTop: 2 },
    toggle:      { width: 44, height: 26, background: '#ECE2D5', borderRadius: 999, padding: 3, cursor: 'pointer', transition: 'background 140ms', boxSizing: 'border-box' as const, flexShrink: 0 },
    toggleOn:    { background: '#2E6B52' },
    toggleDot:   { width: 20, height: 20, background: '#FFFCF7', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.18)', transition: 'transform 140ms cubic-bezier(0.34,1.4,0.5,1)' },
    toggleDotOn: { transform: 'translateX(18px)' },
  };

  function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
    return (
      <div style={{ ...s.toggle, ...(on ? s.toggleOn : {}) }} onClick={toggle}>
        <div style={{ ...s.toggleDot, ...(on ? s.toggleDotOn : {}) }} />
      </div>
    );
  }

  return (
    <div style={s.outer}>
      <div style={s.glow} />
      <div style={s.inner}>

        {/* ── Identity ── */}
        <div style={s.identity}>
          <div style={s.avatarRing}>
            <Ring pct={levelPct} color="#F5B948" track="rgba(247,203,91,0.16)" size={110} stroke={6} />
            {user.image
              ? <img src={user.image} alt={user.name ?? ''} referrerPolicy="no-referrer" style={{ ...s.avatar, objectFit: 'cover' as const }} />
              : <div style={s.avatar}>{initial}</div>
            }
            <div style={s.levelChip}>{tLevels('level_label')} {lvlInfo.level}</div>
          </div>

          <div>
            <h1 style={s.idName}>{user.name ?? user.email}</h1>
            <div style={s.idTitle}>{t('identity_level', { level: tLevels(lvlInfo.key), count: stats.totalAnswered })}</div>
            <div style={s.idMeta}>
              <span style={s.metaChip}>
                <i className="ph-fill ph-flame" style={{ color: '#E8623D', fontSize: 13 }} />
                {t('streak_days', { n: user.currentStreak })}
              </span>
              <span style={s.metaChip}>
                <i className="ph-fill ph-lightning" style={{ color: '#F5B948', fontSize: 13 }} />
                {stats.totalCorrect.toLocaleString()} {tLevels('xp_label')}
              </span>
              <span style={s.metaChip}>
                <i className="ph ph-calendar" style={{ fontSize: 13 }} />
                {t('streak_since', { date: joinedDate })}
              </span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, maxWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'rgba(255,252,247,0.6)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <span>{tLevels(lvlInfo.key)}{!lvlInfo.isMax && ` → ${tLevels(LEVEL_KEYS[lvlInfo.level])}`}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {lvlInfo.isMax ? '∞' : `${lvlInfo.xpInLevel} / ${lvlInfo.xpForLevel}`} {tLevels('xp_label')}
                  </span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,252,247,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${levelPct}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #E8623D, #F5B948)', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={s.idActions}>
            <Button variant="primary" size="md" iconAfter="arrow-right" onClick={handlePractice}>
              {t('btn_practice')}
            </Button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div style={s.statsGrid}>

          {/* Speed */}
          <div
            {...hover1.handlers}
            className="transition-transform duration-150 ease-out"
            style={{
              ...s.statCard,
              background:  '#E8623D',
              color:       '#FFFCF7',
              boxShadow:   hover1.hovered ? '0 6px 0 #A33E22' : '0 4px 0 #A33E22',
              transform:   hover1.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div style={s.statHead}>
              <span style={s.statLab}>{t('kpi_speed')}</span>
              <i className="ph-fill ph-lightning" style={{ fontSize: 18, color: '#F5B948' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={s.statNum}>{stats.avgSecondsPerQuestion}</span>
              <span style={s.statUnit}>s</span>
            </div>
            <div style={{ ...s.statTrend, color: '#FCEBB7' }}>
              <i className="ph-bold ph-timer" />
              {t('kpi_speed_sub')}
            </div>
            <Sparkline data={[stats.avgSecondsPerQuestion]} color="#FFFCF7" />
          </div>

          {/* Accuracy */}
          <div
            {...hover2.handlers}
            className="transition-transform duration-150 ease-out"
            style={{
              ...s.statCard,
              background: '#FFFBF1',
              boxShadow:  hover2.hovered ? '0 6px 0 #2A1F1A' : '0 4px 0 #2A1F1A',
              transform:  hover2.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div style={s.statHead}>
              <span style={{ ...s.statLab, color: '#7A6A60' }}>{t('kpi_accuracy')}</span>
              <i className="ph-fill ph-target" style={{ fontSize: 18, color: '#7AB89B' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <div style={{ position: 'relative', width: 72, height: 72 }}>
                <Ring pct={stats.overallAccuracy} color="#7AB89B" track="#ECE2D5" size={72} stroke={8} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: '#2A1F1A' }}>
                  {stats.overallAccuracy}%
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#7A6A60', fontWeight: 600 }}>
                {t('kpi_accuracy_sub', { correct: stats.totalCorrect.toLocaleString(), total: stats.totalAnswered.toLocaleString() })}
              </div>
            </div>
          </div>

          {/* Total answers */}
          <div
            {...hover3.handlers}
            className="transition-transform duration-150 ease-out"
            style={{
              ...s.statCard,
              background: '#FFFBF1',
              boxShadow:  hover3.hovered ? '0 6px 0 #2A1F1A' : '0 4px 0 #2A1F1A',
              transform:  hover3.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div style={s.statHead}>
              <span style={{ ...s.statLab, color: '#7A6A60' }}>{t('kpi_answers')}</span>
              <i className="ph-fill ph-book-open-text" style={{ fontSize: 18, color: '#F5B948' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, color: '#2A1F1A' }}>
              <span style={s.statNum}>{stats.totalAnswered.toLocaleString()}</span>
            </div>
            <div style={{ ...s.statTrend, color: '#2E6B52' }}>
              <i className="ph-bold ph-trend-up" />
              {t('kpi_answers_sub', { correct: stats.totalCorrect.toLocaleString() })}
            </div>
            <div style={{ height: 8, background: '#ECE2D5', borderRadius: 999, overflow: 'hidden', marginTop: 'auto' }}>
              <div style={{ width: `${stats.overallAccuracy}%`, height: '100%', background: 'linear-gradient(90deg, #E8623D, #F5B948)', borderRadius: 999 }} />
            </div>
          </div>

          {/* Streak */}
          <div
            {...hover4.handlers}
            className="transition-transform duration-150 ease-out"
            style={{
              ...s.statCard,
              background: '#FFFBF1',
              boxShadow:  hover4.hovered ? '0 6px 0 #2A1F1A' : '0 4px 0 #2A1F1A',
              transform:  hover4.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div style={s.statHead}>
              <span style={s.statLab}>{t('kpi_streak')}</span>
              <i className="ph-fill ph-flame" style={{ fontSize: 18, color: '#E8623D' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={s.statNum}>{user.currentStreak}</span>
              <span style={s.statUnit}>d</span>
            </div>
            <div style={{ ...s.statTrend, color: '#7A2D17' }}>
              <i className="ph-bold ph-trophy" />
              {t('kpi_streak_best', { n: user.longestStreak })}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 'auto' }}>
              {weekBars.map((w, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: w.mins > 0 ? '#2A1F1A' : 'rgba(42,31,26,0.16)' }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, color: '#7A2D17' }}>{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity heatmap + weekly bar ── */}
        <div style={s.twoCol}>
          <div style={s.panel}>
            <div style={s.sectionHead}>
              <h3 style={s.sectionTitle}>{t('heatmap_title')}</h3>
              <span style={{ fontSize: 12, color: '#7A6A60', fontWeight: 700 }}>{t('heatmap_active', { n: activeDays })}</span>
            </div>
            <div style={s.heatGrid}>
              {heatGrid.map((v, i) => (
                <div key={i} style={{ ...s.heatCell, background: HEAT_COLORS[v] }} />
              ))}
            </div>
            <div style={s.heatLegend}>
              <span>{t('heatmap_less')}</span>
              <div style={{ display: 'inline-flex', gap: 3 }}>
                {HEAT_COLORS.map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                ))}
              </div>
              <span>{t('heatmap_more')}</span>
            </div>
          </div>

          <div style={s.panel}>
            <div style={s.sectionHead}>
              <h3 style={s.sectionTitle}>{t('weekly_title')}</h3>
              <span style={{ fontSize: 12, color: '#7A6A60', fontWeight: 700 }}>{weekTotal} min</span>
            </div>
            <div style={s.chartBars}>
              {weekBars.map((w, i) => (
                <div key={i} style={{ ...s.bar, height: `${Math.max(4, (w.mins / barMax) * 100)}%` }}>
                  {w.mins > 0 && <span style={s.barValue}>{w.mins}</span>}
                  <span style={s.barLabel}>{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tense breakdown + weak spots ── */}
        {(coloredTenses.length > 0 || weakSpots.length > 0) && (
          <div style={s.twoCol}>
            <div style={s.panel}>
              <div style={s.sectionHead}>
                <h3 style={s.sectionTitle}>{t('tenses_title')}</h3>
              </div>
              {coloredTenses.length === 0
                ? <p style={{ color: '#7A6A60', fontSize: 14 }}>{t('tenses_empty')}</p>
                : coloredTenses.map((tb, i, arr) => (
                  <div key={i} className="transition-colors duration-150 ease-out rounded-lg hover:bg-black/[0.03] cursor-default" style={{ ...s.tenseRow, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
                    <span style={s.tenseLabel}>{tb.label}</span>
                    <div style={s.tenseTrack}>
                      <div style={{ ...s.tenseFill, width: `${tb.accuracy}%`, background: tb.color }} />
                    </div>
                    <span style={s.tenseValue}>{tb.accuracy}%</span>
                  </div>
                ))
              }
            </div>

            <div style={s.panel}>
              <div style={s.sectionHead}>
                <h3 style={s.sectionTitle}>{t('weak_title')}</h3>
                {weakSpots.length > 0 && (
                  <span style={s.sectionMore} onClick={handlePractice}>{t('weak_train')}</span>
                )}
              </div>
              {weakSpots.length === 0
                ? <p style={{ color: '#7A6A60', fontSize: 14 }}>{t('weak_empty')}</p>
                : weakSpots.map((w, i, arr) => {
                    const { bg, color } = weakColors(w.accuracy);
                    return (
                      <div key={i} className="transition-colors duration-150 ease-out rounded-lg hover:bg-black/[0.03] cursor-default" style={{ ...s.weakRow, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
                        <span style={{ ...s.weakIcon, background: bg, color }}>{w.pronoun}</span>
                        <div style={s.weakBody}>
                          <span style={s.weakVerb}>{w.verbInfinitive}</span>
                          <span style={s.weakMeta}>{tenseLabel(w.tense)}</span>
                        </div>
                        <span style={{ color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14 }}>{w.accuracy}%</span>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* ── Practice settings ── */}
        <div style={s.panel}>
          <div style={s.sectionHead}>
            <h3 style={s.sectionTitle}>{t('settings_title')}</h3>
          </div>
          {([
            { title: t('setting_reminder'), sub: t('setting_reminder_sub'), on: reminderOn, toggle: () => setReminderOn(v => { const next = !v; localStorage.setItem('cg_reminder',  String(next)); return next; }) },
            { title: t('setting_sound'),    sub: t('setting_sound_sub'),    on: soundOn,    toggle: () => setSoundOn(v =>    { const next = !v; localStorage.setItem('cg_sound',    String(next)); return next; }) },
            { title: t('setting_hard'),     sub: t('setting_hard_sub'),     on: hardMode,   toggle: () => setHardMode(v =>   { const next = !v; localStorage.setItem('cg_hard',     String(next)); return next; }) },
            { title: t('setting_autonext'), sub: t('setting_autonext_sub'), on: autoNext,   toggle: () => setAutoNext(v =>   { const next = !v; localStorage.setItem('cg_autonext', String(next)); return next; }) },
          ] as const).map((row, i, arr) => (
            <div key={i} style={{ ...s.settingRow, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
              <div>
                <div style={s.settingTitle}>{row.title}</div>
                <div style={s.settingSub}>{row.sub}</div>
              </div>
              <Toggle on={row.on} toggle={row.toggle} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
