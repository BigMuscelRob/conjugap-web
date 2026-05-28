'use client';

// ConjuGap — Dashboard (client component)
// Fetches /api/profile and renders the full dashboard screen.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { getLevelInfo, LEVEL_KEYS } from '@/lib/xpSystem';
import { usePracticeSettings } from '@/hooks/usePracticeSettings';
import { useProfileData } from '@/hooks/useProfileData';
import { tenseLabel, buildHeatGrid, tenseColor, weakColors } from '@/lib/dashboardHelpers';

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
    <div className="bg-cream min-h-[90vh] px-4 sm:px-6 py-10 pb-[120px]">
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
        <div className="bg-ink-900 rounded-[28px] p-7 h-[160px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[0,1,2,3].map(i => <SkeletonBlock key={i} h={152} r={20} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <SkeletonBlock h={200} r={20} />
          <SkeletonBlock h={200} r={20} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <div
      className={`w-11 h-[26px] rounded-pill p-[3px] cursor-pointer transition-colors duration-150 shrink-0 ${on ? 'bg-[#2E6B52]' : 'bg-[#ECE2D5]'}`}
      onClick={toggle}
    >
      <div className={`w-5 h-5 bg-white-warm rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-transform duration-150 ${on ? 'translate-x-[18px]' : ''}`} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({ onPractice }: { onPractice?: () => void }) {
  const router   = useRouter();
  const t        = useTranslations('dashboard');
  const tLevels  = useTranslations('levels');

  const { data, loading, error } = useProfileData();

  const { soundOn, toggleSound, hardMode, toggleHardMode, autoNext, toggleAutoNext } = usePracticeSettings();

  const handlePractice = () => { onPractice ? onPractice() : router.push('/practice'); };

  const hover1 = useHover();
  const hover2 = useHover();
  const hover3 = useHover();
  const hover4 = useHover();

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return (
    <div className="min-h-[60vh] flex items-center justify-center flex-col gap-3 bg-cream">
      <i className="ph-fill ph-warning-circle text-[48px] text-[#C2456E]" />
      <p className="font-display text-xl font-bold text-ink-900">{t('error_title')}</p>
      <p className="text-sm text-ink-500">{error}</p>
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

  return (
    <div className="relative min-h-[90vh] bg-cream overflow-hidden px-4 sm:px-6 py-10 pb-[120px]">

      {/* Radial glow — runtime gradient, keep inline */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360, background: 'radial-gradient(900px 360px at 20% 0%, #FFE6BD 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div className="relative max-w-[1120px] mx-auto flex flex-col gap-6">

        {/* ── Identity ── */}
        <div className="bg-ink-900 text-white-warm rounded-[28px] p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6 items-center shadow-[0_6px_0_#1a0f0a] relative overflow-hidden">

          {/* Avatar + XP ring */}
          <div className="relative w-[110px] h-[110px]">
            <Ring pct={levelPct} color="#F5B948" track="rgba(247,203,91,0.16)" size={110} stroke={6} />
            {user.image
              ? <img src={user.image} alt={user.name ?? ''} referrerPolicy="no-referrer"
                  className="w-[88px] h-[88px] rounded-full absolute top-[11px] left-[11px] border-[3px] border-ink-900 object-cover" />
              : <div className="w-[88px] h-[88px] rounded-full bg-[#E8623D] flex items-center justify-center font-display text-[36px] font-bold text-white-warm absolute top-[11px] left-[11px] border-[3px] border-ink-900">
                  {initial}
                </div>
            }
            <div className="absolute bottom-[-6px] right-[-6px] bg-[#F5B948] text-ink-900 text-[11px] font-bold py-1 px-2 rounded-pill border-2 border-ink-900 font-mono">
              {tLevels('level_label')} {lvlInfo.level}
            </div>
          </div>

          {/* Name + level + chips + XP bar */}
          <div>
            <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-tightest m-0">
              {user.name ?? user.email}
            </h1>
            <div className="text-[13px] font-bold text-[#F7CB5B] uppercase tracking-[0.1em] mt-1">
              {t('identity_level', { level: tLevels(lvlInfo.key), count: stats.totalAnswered })}
            </div>
            <div className="flex gap-2.5 mt-3.5 flex-wrap">
              <span className="bg-white/[0.08] border border-white/[0.16] py-1.5 px-3 rounded-pill text-xs font-bold text-white-warm inline-flex items-center gap-1.5">
                <i className="ph-fill ph-flame" style={{ color: '#E8623D', fontSize: 13 }} />
                {t('streak_days', { n: user.currentStreak })}
              </span>
              <span className="bg-white/[0.08] border border-white/[0.16] py-1.5 px-3 rounded-pill text-xs font-bold text-white-warm inline-flex items-center gap-1.5">
                <i className="ph-fill ph-lightning" style={{ color: '#F5B948', fontSize: 13 }} />
                {stats.totalCorrect.toLocaleString()} {tLevels('xp_label')}
              </span>
              <span className="bg-white/[0.08] border border-white/[0.16] py-1.5 px-3 rounded-pill text-xs font-bold text-white-warm inline-flex items-center gap-1.5">
                <i className="ph ph-calendar" style={{ fontSize: 13 }} />
                {t('streak_since', { date: joinedDate })}
              </span>
            </div>
            <div className="mt-3.5 flex items-center gap-3">
              <div className="flex-1 max-w-[280px]">
                <div className="flex justify-between text-[11px] font-bold text-white-warm/60 mb-1 uppercase tracking-[0.08em]">
                  <span>{tLevels(lvlInfo.key)}{!lvlInfo.isMax && ` → ${tLevels(LEVEL_KEYS[lvlInfo.level])}`}</span>
                  <span className="font-mono">
                    {lvlInfo.isMax ? '∞' : `${lvlInfo.xpInLevel} / ${lvlInfo.xpForLevel}`} {tLevels('xp_label')}
                  </span>
                </div>
                <div className="h-2.5 bg-white/[0.1] rounded-full overflow-hidden">
                  {/* width is runtime-computed — keep inline */}
                  <div style={{ width: `${levelPct}%` }} className="h-full rounded-full bg-gradient-to-r from-[#E8623D] to-[#F5B948] transition-[width] duration-[600ms] ease-out" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 items-end">
            <Button variant="primary" size="md" iconAfter="arrow-right" onClick={handlePractice}>
              {t('btn_practice')}
            </Button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">

          {/* Speed */}
          <div
            {...hover1.handlers}
            className="p-4 sm:p-[18px] rounded-[20px] border-2 border-ink-900 bg-[#E8623D] text-white-warm flex flex-col gap-2 min-h-[140px] sm:min-h-[152px] relative overflow-hidden transition-transform duration-150 ease-out"
            style={{
              boxShadow: hover1.hovered ? '0 6px 0 #A33E22' : '0 4px 0 #A33E22',
              transform:  hover1.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{t('kpi_speed')}</span>
              <i className="ph-fill ph-lightning" style={{ fontSize: 18, color: '#F5B948' }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[40px] font-bold tracking-[-0.025em] leading-none">{stats.avgSecondsPerQuestion}</span>
              <span className="font-mono text-sm font-bold opacity-80">s</span>
            </div>
            <div className="text-[11px] font-bold inline-flex items-center gap-1 text-[#FCEBB7]">
              <i className="ph-bold ph-timer" />
              {t('kpi_speed_sub')}
            </div>
            <Sparkline data={[stats.avgSecondsPerQuestion]} color="#FFFCF7" />
          </div>

          {/* Accuracy */}
          <div
            {...hover2.handlers}
            className="p-4 sm:p-[18px] rounded-[20px] border-2 border-ink-900 bg-paper flex flex-col gap-2 min-h-[140px] sm:min-h-[152px] relative overflow-hidden transition-transform duration-150 ease-out"
            style={{
              boxShadow: hover2.hovered ? '0 6px 0 #2A1F1A' : '0 4px 0 #2A1F1A',
              transform:  hover2.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">{t('kpi_accuracy')}</span>
              <i className="ph-fill ph-target" style={{ fontSize: 18, color: '#7AB89B' }} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="relative w-[72px] h-[72px]">
                <Ring pct={stats.overallAccuracy} color="#7AB89B" track="#ECE2D5" size={72} stroke={8} />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-ink-900">
                  {stats.overallAccuracy}%
                </div>
              </div>
              <div className="text-[11px] text-ink-500 font-semibold">
                {t('kpi_accuracy_sub', { correct: stats.totalCorrect.toLocaleString(), total: stats.totalAnswered.toLocaleString() })}
              </div>
            </div>
          </div>

          {/* Total answers */}
          <div
            {...hover3.handlers}
            className="p-4 sm:p-[18px] rounded-[20px] border-2 border-ink-900 bg-paper flex flex-col gap-2 min-h-[140px] sm:min-h-[152px] relative overflow-hidden transition-transform duration-150 ease-out"
            style={{
              boxShadow: hover3.hovered ? '0 6px 0 #2A1F1A' : '0 4px 0 #2A1F1A',
              transform:  hover3.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">{t('kpi_answers')}</span>
              <i className="ph-fill ph-book-open-text" style={{ fontSize: 18, color: '#F5B948' }} />
            </div>
            <div className="flex items-baseline gap-1.5 text-ink-900">
              <span className="font-display text-[40px] font-bold tracking-[-0.025em] leading-none">{stats.totalAnswered.toLocaleString()}</span>
            </div>
            <div className="text-[11px] font-bold inline-flex items-center gap-1 text-[#2E6B52]">
              <i className="ph-bold ph-trend-up" />
              {t('kpi_answers_sub', { correct: stats.totalCorrect.toLocaleString() })}
            </div>
            <div className="h-2 bg-cream rounded-full overflow-hidden mt-auto">
              {/* width is runtime-computed — keep inline */}
              <div style={{ width: `${stats.overallAccuracy}%` }} className="h-full bg-gradient-to-r from-[#E8623D] to-[#F5B948] rounded-full" />
            </div>
          </div>

          {/* Streak */}
          <div
            {...hover4.handlers}
            className="p-4 sm:p-[18px] rounded-[20px] border-2 border-ink-900 bg-paper flex flex-col gap-2 min-h-[140px] sm:min-h-[152px] relative overflow-hidden transition-transform duration-150 ease-out"
            style={{
              boxShadow: hover4.hovered ? '0 6px 0 #2A1F1A' : '0 4px 0 #2A1F1A',
              transform:  hover4.hovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{t('kpi_streak')}</span>
              <i className="ph-fill ph-flame" style={{ fontSize: 18, color: '#E8623D' }} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[40px] font-bold tracking-[-0.025em] leading-none">{user.currentStreak}</span>
              <span className="font-mono text-sm font-bold opacity-80">d</span>
            </div>
            <div className="text-[11px] font-bold inline-flex items-center gap-1 text-[#7A2D17]">
              <i className="ph-bold ph-trophy" />
              {t('kpi_streak_best', { n: user.longestStreak })}
            </div>
            <div className="flex gap-1 mt-auto">
              {weekBars.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {/* bar color is runtime-computed — keep inline */}
                  <div className="w-full h-1.5 rounded-[3px]" style={{ background: w.mins > 0 ? '#2A1F1A' : 'rgba(42,31,26,0.16)' }} />
                  <span className="font-mono text-[9px] font-bold text-[#7A2D17]">{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity heatmap + weekly bar ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3.5">

          {/* Heatmap */}
          <div className="bg-paper border-2 border-ink-900 rounded-[20px] p-5 shadow-[0_4px_0_#2A1F1A] flex flex-col gap-3.5">
            <div className="flex items-baseline justify-between px-1 pt-1">
              <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 m-0">{t('heatmap_title')}</h3>
              <span className="text-xs text-ink-500 font-bold">{t('heatmap_active', { n: activeDays })}</span>
            </div>
            {/* gridTemplateColumns is runtime-computed — keep inline */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(heatGrid.length / 7)}, 1fr)`, gridAutoRows: '14px', gap: 4 }}>
              {heatGrid.map((v, i) => (
                /* background is runtime-computed from HEAT_COLORS — keep inline */
                <div key={i} className="rounded-[3px] cursor-default" style={{ background: HEAT_COLORS[v] }} />
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 text-[11px] text-ink-500 font-bold">
              <span>{t('heatmap_less')}</span>
              <div className="inline-flex gap-[3px]">
                {HEAT_COLORS.map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />
                ))}
              </div>
              <span>{t('heatmap_more')}</span>
            </div>
          </div>

          {/* Weekly bar chart */}
          <div className="bg-paper border-2 border-ink-900 rounded-[20px] p-5 shadow-[0_4px_0_#2A1F1A] flex flex-col gap-3.5">
            <div className="flex items-baseline justify-between px-1 pt-1">
              <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 m-0">{t('weekly_title')}</h3>
              <span className="text-xs text-ink-500 font-bold">{weekTotal} min</span>
            </div>
            <div className="flex items-end gap-2 h-[140px] px-1">
              {weekBars.map((w, i) => (
                /* height is runtime-computed — keep inline */
                <div
                  key={i}
                  className="flex-1 relative rounded-t-[6px] rounded-b-[2px] bg-gradient-to-b from-[#E8623D] to-[#F5B948] flex flex-col justify-end"
                  style={{ height: `${Math.max(4, (w.mins / barMax) * 100)}%` }}
                >
                  {w.mins > 0 && (
                    <span className="absolute top-[-18px] left-0 right-0 text-center text-[10px] font-mono text-ink-900 font-bold">{w.mins}</span>
                  )}
                  <span className="absolute bottom-[-22px] left-0 right-0 text-center text-[10px] font-mono text-ink-500 font-bold">{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tense breakdown + weak spots ── */}
        {(coloredTenses.length > 0 || weakSpots.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3.5">

            {/* Tense accuracy */}
            <div className="bg-paper border-2 border-ink-900 rounded-[20px] p-5 shadow-[0_4px_0_#2A1F1A] flex flex-col gap-3.5">
              <div className="flex items-baseline justify-between px-1 pt-1">
                <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 m-0">{t('tenses_title')}</h3>
              </div>
              {coloredTenses.length === 0
                ? <p className="text-sm text-ink-500">{t('tenses_empty')}</p>
                : coloredTenses.map((tb, i, arr) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[100px_1fr_48px] sm:grid-cols-[160px_1fr_60px] items-center gap-3 sm:gap-3.5 py-2.5 transition-colors duration-150 ease-out rounded-lg hover:bg-black/[0.03] cursor-default${i < arr.length - 1 ? ' border-b border-dashed border-ink-900/[0.08]' : ''}`}
                  >
                    <span className="font-bold text-ink-900 text-sm">{tb.label}</span>
                    <div className="h-3 bg-cream rounded-full overflow-hidden">
                      {/* width and background are runtime-computed — keep inline */}
                      <div className="h-full rounded-full" style={{ width: `${tb.accuracy}%`, background: tb.color }} />
                    </div>
                    <span className="font-mono font-bold text-ink-900 text-sm text-right">{tb.accuracy}%</span>
                  </div>
                ))
              }
            </div>

            {/* Weak spots */}
            <div className="bg-paper border-2 border-ink-900 rounded-[20px] p-5 shadow-[0_4px_0_#2A1F1A] flex flex-col gap-3.5">
              <div className="flex items-baseline justify-between px-1 pt-1">
                <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 m-0">{t('weak_title')}</h3>
                {weakSpots.length > 0 && (
                  <span className="text-xs text-ink-500 font-bold uppercase tracking-[0.08em] cursor-pointer" onClick={handlePractice}>
                    {t('weak_train')}
                  </span>
                )}
              </div>
              {weakSpots.length === 0
                ? <p className="text-sm text-ink-500">{t('weak_empty')}</p>
                : weakSpots.map((w, i, arr) => {
                    const { bg, color } = weakColors(w.accuracy);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3.5 py-3 transition-colors duration-150 ease-out rounded-lg hover:bg-black/[0.03] cursor-default${i < arr.length - 1 ? ' border-b border-dashed border-ink-900/[0.08]' : ''}`}
                      >
                        {/* bg and color are runtime-computed — keep inline */}
                        <span className="min-w-[36px] h-9 px-2 rounded-[10px] inline-flex items-center justify-center font-mono text-[11px] font-bold shrink-0 whitespace-nowrap" style={{ background: bg, color }}>
                          {w.pronoun}
                        </span>
                        <div className="flex-1 flex flex-col">
                          <span className="font-mono text-[15px] font-bold text-ink-900">{w.verbInfinitive}</span>
                          <span className="text-xs text-ink-500 font-semibold">{tenseLabel(w.tense)}</span>
                        </div>
                        {/* color is runtime-computed — keep inline */}
                        <span className="font-mono font-bold text-sm" style={{ color }}>{w.accuracy}%</span>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* ── Practice settings ── */}
        <div className="bg-paper border-2 border-ink-900 rounded-[20px] p-5 shadow-[0_4px_0_#2A1F1A] flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between px-1 pt-1">
            <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 m-0">{t('settings_title')}</h3>
          </div>
          {([
            { title: t('setting_sound'),    sub: t('setting_sound_sub'),    on: soundOn,  toggle: toggleSound    },
            { title: t('setting_hard'),     sub: t('setting_hard_sub'),     on: hardMode, toggle: toggleHardMode },
            { title: t('setting_autonext'), sub: t('setting_autonext_sub'), on: autoNext, toggle: toggleAutoNext },
          ] as const).map((row, i, arr) => (
            <div key={i} className={`flex items-center justify-between py-3${i < arr.length - 1 ? ' border-b border-ink-900/[0.06]' : ''}`}>
              <div>
                <div className="text-sm font-bold text-ink-900">{row.title}</div>
                <div className="text-xs text-ink-500 font-semibold mt-0.5">{row.sub}</div>
              </div>
              <Toggle on={row.on} toggle={row.toggle} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
