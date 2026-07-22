// ============================================================
// Componentes de gráfico SVG — Panorama do Mercado
// Replicam fielmente as funções drawBarChart, drawLineChart e
// drawGroupedBarChart do HTML original (PanoramadoConsórcio).
// Cores exatas: terra #c2410c, olive #2f5233, black #15140f
// ============================================================

import React, { useMemo } from 'react';
import { COLORS } from '@/lib/panoramaData';

// ── Formatadores (idênticos ao HTML original) ────────────────
export function fmtNum(v: number): string {
  const n = Number(v);
  if (Math.abs(n) >= 1)
    return (
      n
        .toLocaleString('pt-BR', {
          minimumFractionDigits: n < 10 ? 2 : 1,
          maximumFractionDigits: n < 10 ? 2 : 1,
        })
        .replace(/,0$/, '') + ' milhões'
    );
  return (n * 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
}

export function fmtShort(v: number): string {
  return fmtNum(v).replace(' milhões', ' mi').replace(' mil', ' mil');
}

export function fmtPct(v: number): string {
  return (
    (Number(v) * 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + '%'
  );
}

export function shortPct(v: number): string {
  return (
    (Number(v) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'
  );
}

export function pp(a: number, b: number): string {
  const d = (b - a) * 100;
  const s = d >= 0 ? '+' : '';
  return (
    s +
    d.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) +
    ' p.p.'
  );
}

// ── Helpers internos ─────────────────────────────────────────
function niceTicks(max: number, count: number): number[] {
  const raw = max / (count - 1);
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) out.push(v);
  return out;
}

interface Box { x: number; y: number; w: number; h: number }

function Axes({
  box, yTicks, fmtY,
}: {
  box: Box;
  yTicks: number[];
  fmtY: (v: number) => string;
}) {
  const { x, y, w, h } = box;
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  return (
    <>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={COLORS.line} strokeWidth={1} />
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={COLORS.line} strokeWidth={1} />
      {yTicks.map((t) => {
        const yy = y + h - ((t - yMin) / (yMax - yMin)) * h;
        return (
          <g key={t}>
            <line x1={x} y1={yy} x2={x + w} y2={yy} stroke="#ece7dc" strokeWidth={1} />
            <text x={x - 10} y={yy + 4} textAnchor="end" className="axis-label" fontSize={10} fill={COLORS.muted}>
              {fmtY(t)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function Legend({ series, x, y }: { series: { name: string; color: string }[]; x: number; y: number }) {
  let cursor = x;
  return (
    <>
      {series.map((s) => {
        const el = (
          <g key={s.name}>
            <rect x={cursor} y={y - 8} width={9} height={9} rx={2} fill={s.color} />
            <text x={cursor + 14} y={y} className="axis-label" fontSize={10} fill={COLORS.muted}>{s.name}</text>
          </g>
        );
        cursor += Math.max(95, s.name.length * 7 + 30);
        return el;
      })}
    </>
  );
}

// ── BarChart ─────────────────────────────────────────────────
export interface BarRow { x: number | string; y: number; color?: string }

export function BarChart({
  data,
  yMax,
  integer = false,
  height = 300,
}: {
  data: BarRow[];
  yMax?: number;
  integer?: boolean;
  height?: number;
}) {
  const W = 700;
  const H = height;
  const m = { l: 60, r: 18, t: 26, b: 38 };
  const box: Box = { x: m.l, y: m.t, w: W - m.l - m.r, h: H - m.t - m.b };

  const maxVal = yMax ?? Math.max(...data.map((d) => d.y)) * 1.18;
  const yTicks = niceTicks(maxVal, 5);
  const yMin = 0;
  const yMaxT = yTicks[yTicks.length - 1];
  const bw = (box.w / data.length) * 0.62;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <Axes box={box} yTicks={yTicks} fmtY={(v) => (integer ? v.toLocaleString('pt-BR') : fmtShort(v))} />
      {data.map((d, i) => {
        const cx = box.x + ((i + 0.5) / data.length) * box.w;
        const hh = ((d.y - yMin) / (yMaxT - yMin)) * box.h;
        const rx = cx - bw / 2;
        const ry = box.y + box.h - hh;
        const label = integer ? d.y.toLocaleString('pt-BR') : fmtShort(d.y);
        return (
          <g key={i}>
            <rect x={rx} y={ry} width={bw} height={hh} rx={3} fill={d.color ?? COLORS.terra} />
            <text x={cx} y={box.y + box.h + 22} textAnchor="middle" fontSize={10} fill={COLORS.muted}>{d.x}</text>
            <text x={cx} y={ry - 8} textAnchor="middle" fontSize={10} fill={d.color ?? COLORS.terra} fontWeight="600">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── LineChart ────────────────────────────────────────────────
export interface LineSeries {
  name: string;
  color: string;
  values: { x: number; y: number }[];
}

export function LineChart({
  series,
  percent = false,
  yMin: yMinProp = 0,
  yMax: yMaxProp,
  legend = false,
  height = 300,
}: {
  series: LineSeries[];
  percent?: boolean;
  yMin?: number;
  yMax?: number;
  legend?: boolean;
  height?: number;
}) {
  const W = 700;
  const H = height;
  const m = { l: 60, r: 18, t: legend ? 30 : 18, b: 38 };
  const box: Box = { x: m.l, y: m.t, w: W - m.l - m.r, h: H - m.t - m.b };

  const years = useMemo(
    () => Array.from(new Set(series.flatMap((s) => s.values.map((d) => d.x)))).sort((a, b) => a - b),
    [series]
  );

  const allVals = series.flatMap((s) => s.values.map((d) => d.y));
  const yTicks = percent ? [0, 0.25, 0.5, 0.75, 1.0] : niceTicks(yMaxProp ?? Math.max(...allVals) * 1.18, 5);
  const yMin = yMinProp;
  const yMax = yMaxProp ?? yTicks[yTicks.length - 1];

  function X(xv: number) {
    const i = years.indexOf(xv);
    return box.x + (years.length === 1 ? 0.5 : i / (years.length - 1)) * box.w;
  }
  function Y(yv: number) {
    return box.y + box.h - ((yv - yMin) / (yMax - yMin)) * box.h;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <Axes box={box} yTicks={yTicks} fmtY={percent ? fmtPct : fmtShort} />
      {years.map((yr) => (
        <text key={yr} x={X(yr)} y={box.y + box.h + 22} textAnchor="middle" fontSize={10} fill={COLORS.muted}>{yr}</text>
      ))}
      {series.map((s) => {
        const pts = s.values.map((d) => `${X(d.x)},${Y(d.y)}`).join(' ');
        return (
          <polyline
            key={s.name}
            points={pts}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      {years.map((yr) => {
        const rows = series
          .map((s) => ({ s, d: s.values.find((v) => v.x === yr) }))
          .filter((r) => r.d)
          .sort((a, b) => (b.d!.y - a.d!.y));
        return rows.map((r, idx) => {
          const xx = X(yr);
          const yy = Y(r.d!.y);
          const label = percent ? shortPct(r.d!.y) : fmtShort(r.d!.y);
          const ty = rows.length === 1 ? yy - 11 : idx === 0 ? yy - 11 : yy + 18;
          return (
            <g key={`${yr}-${r.s.name}`}>
              <circle cx={xx} cy={yy} r={4} fill={r.s.color} stroke="#fffdf8" strokeWidth={2} />
              <text x={xx} y={ty} textAnchor="middle" fontSize={10} fill={r.s.color} fontWeight="600">{label}</text>
            </g>
          );
        });
      })}
      {legend && <Legend series={series} x={box.x} y={m.t - 14} />}
    </svg>
  );
}

// ── GroupedBarChart ──────────────────────────────────────────
export interface GroupedSeries {
  name: string;
  color: string;
  values: { x: number; y: number }[];
}

export function GroupedBarChart({
  series,
  yMax: yMaxProp,
  height = 420,
}: {
  series: GroupedSeries[];
  yMax?: number;
  height?: number;
}) {
  const W = 700;
  const H = height;
  const m = { l: 60, r: 18, t: 48, b: 48 };
  const box: Box = { x: m.l, y: m.t, w: W - m.l - m.r, h: H - m.t - m.b };

  const years = useMemo(
    () => Array.from(new Set(series.flatMap((s) => s.values.map((d) => d.x)))).sort((a, b) => a - b),
    [series]
  );
  const allVals = series.flatMap((s) => s.values.map((d) => d.y));
  const yMax = yMaxProp ?? Math.max(...allVals) * 1.18;
  const yTicks = niceTicks(yMax, 5);
  const yMaxT = yTicks[yTicks.length - 1];

  const groupW = (box.w / years.length) * 0.82;
  const bw = groupW / series.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <Legend series={series} x={box.x} y={20} />
      <Axes box={box} yTicks={yTicks} fmtY={fmtShort} />
      {years.map((yr, i) => {
        const gx = box.x + ((i + 0.5) / years.length) * box.w - groupW / 2;
        return (
          <g key={yr}>
            <text x={gx + groupW / 2} y={box.y + box.h + 24} textAnchor="middle" fontSize={10} fill={COLORS.muted}>{yr}</text>
            {series.map((s, j) => {
              const row = s.values.find((d) => d.x === yr);
              if (!row) return null;
              const hh = (row.y / yMaxT) * box.h;
              const x = gx + j * bw;
              const y = box.y + box.h - hh;
              const labelY = Math.max(box.y + 12, y - 6);
              return (
                <g key={s.name}>
                  <rect x={x} y={y} width={bw * 0.78} height={hh} rx={2} fill={s.color} />
                  <text x={x + (bw * 0.78) / 2} y={labelY} textAnchor="middle" fontSize={9} fill={s.color} fontWeight="600">{fmtShort(row.y)}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
