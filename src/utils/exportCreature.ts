import type { Creature } from '../types';
import type { CreatureStats } from '../physics';
import type { MakerStamp } from '../data/family';
import { activeStamp } from '../data/family';
import { getCreaturePoints } from '../data/points';

export async function exportCreatureCard(creature: Creature, stats: CreatureStats, makerOverride?: MakerStamp | null): Promise<void> {
  const svgEl = document.querySelector('.creature-stage-habitat svg') as SVGElement | null;
  if (!svgEl) {
    alert('Could not find creature image to export.');
    return;
  }
  const clone = svgEl.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const xml = new XMLSerializer().serializeToString(clone);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const svgUrl = `data:image/svg+xml;base64,${svg64}`;

  const W = 800;
  const H = 760;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#fff8e8');
  grad.addColorStop(1, '#f5efd8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const accent = ctx.createLinearGradient(0, 0, W, 8);
  accent.addColorStop(0, '#e07b5b');
  accent.addColorStop(0.5, '#d68db5');
  accent.addColorStop(1, '#5b9fe0');
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 8);

  ctx.fillStyle = '#2a2120';
  ctx.font = 'bold 38px ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
  ctx.fillText('🦎 Critter Forge', 32, 60);
  ctx.font = '15px ui-rounded, system-ui, sans-serif';
  ctx.fillStyle = '#7a6964';
  ctx.fillText('design a creature — real biology decides if it survives', 32, 85);

  // Maker badge (bottom-right of the header strip) — "by 🐯 Adam".
  const maker = makerOverride ?? activeStamp();
  if (maker) {
    const badge = `${maker.emoji} by ${maker.name}`;
    ctx.font = 'bold 18px ui-rounded, system-ui, sans-serif';
    const w = ctx.measureText(badge).width + 28;
    const bx = W - 32 - w;
    const by = 32;
    // pill background
    ctx.fillStyle = maker.color;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bx, by, w, 36, 18);
    } else {
      ctx.rect(bx, by, w, 36);
    }
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badge, bx + 14, by + 24);
  }

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 80, 110, W - 160, 480);
      resolve();
    };
    img.onerror = reject;
    img.src = svgUrl;
  });

  ctx.fillStyle = '#2a2120';
  ctx.font = 'bold 32px ui-rounded, system-ui, sans-serif';
  ctx.fillText(creature.name, 32, 640);

  ctx.font = '15px ui-rounded, system-ui, sans-serif';
  ctx.fillStyle = '#6f6764';
  const massText = stats.massKg < 1
    ? `${Math.round(stats.massKg * 1000)} g`
    : stats.massKg < 10 ? `${stats.massKg.toFixed(1)} kg`
    : stats.massKg < 1000 ? `${Math.round(stats.massKg)} kg`
    : `${(stats.massKg / 1000).toFixed(1)} t`;
  ctx.fillText(`${creature.bodyPlan} · ${creature.warmBlooded ? 'warm' : 'cold'}-blooded · ${massText}`, 32, 665);

  const statRow = [
    `💨 ${stats.topSpeedKmh} km/h`,
    `🏃 ${stats.enduranceKm} km`,
    `🥶 ${Math.round(stats.coldTolerance)}`,
    `⏳ ${stats.lifespanYears}y`,
    `💗 ${stats.heartRateBpm} bpm`,
  ].join('  ·  ');
  ctx.font = 'bold 18px ui-rounded, system-ui, sans-serif';
  ctx.fillStyle = '#2a2120';
  ctx.fillText(statRow, 32, 700);

  // Points line — only if this creature has any awards.
  const cp = getCreaturePoints(creature);
  if (cp && cp.totalPoints > 0) {
    ctx.font = 'bold 16px ui-rounded, system-ui, sans-serif';
    ctx.fillStyle = '#8a5a00';
    ctx.fillText(`🏅 ${cp.totalPoints} pts · ${cp.awards.length} win${cp.awards.length !== 1 ? 's' : ''}`, 32, 722);
  }

  ctx.font = '12px ui-rounded, system-ui, sans-serif';
  ctx.fillStyle = '#888';
  ctx.fillText('daridor9.github.io/critter-forge', 32, 745);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) {
    alert('Export failed — try again.');
    return;
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${creature.name.replace(/\s+/g, '_')}-critter.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
