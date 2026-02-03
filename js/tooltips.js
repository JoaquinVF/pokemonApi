/**
 * Tooltips para movimientos y habilidades (hover): caché, formato y posicionamiento.
 */

import { fetchJson, fetchTypeDisplayName } from './api.js';
import { t, getAppLang } from './translations.js';

const moveCache = {};
const abilityCache = {};
let _moveTooltip = null;

export function showMoveTooltip(html, x, y) {
  if (!_moveTooltip) {
    _moveTooltip = document.createElement('div');
    _moveTooltip.className = 'move-tooltip';
    document.body.appendChild(_moveTooltip);
  }
  _moveTooltip.innerHTML = html;
  _moveTooltip.style.display = 'block';
  const pad = 12;
  requestAnimationFrame(() => {
    const w = _moveTooltip.offsetWidth;
    const h = _moveTooltip.offsetHeight;
    let left = x + pad;
    let top = y + pad;
    if (left + w + 8 > window.innerWidth) left = x - w - pad;
    if (top + h + 8 > window.innerHeight) top = y - h - pad;
    _moveTooltip.style.left = `${Math.max(8, left)}px`;
    _moveTooltip.style.top = `${Math.max(8, top)}px`;
  });
}

export function hideMoveTooltip() {
  if (_moveTooltip) _moveTooltip.style.display = 'none';
}

async function formatMoveHtmlAsync(m) {
  const lang = getAppLang();
  let moveName, effect;
  if (lang === 'es') {
    moveName = (m.names || []).find(n => n.language?.name === 'es')?.name || m.name;
    effect = (m.effect_entries || []).find(e => e.language?.name === 'es')?.short_effect || (m.flavor_text_entries || []).find(e => e.language?.name === 'es')?.flavor_text || '';
  } else {
    moveName = (m.names || []).find(n => n.language?.name === 'en')?.name || m.name;
    effect = (m.effect_entries || []).find(e => e.language?.name === 'en')?.short_effect || (m.flavor_text_entries || []).find(e => e.language?.name === 'en')?.flavor_text || '';
  }
  const typeKey = m.type?.name || (m.type && m.type.name) || null;
  const typeDisplay = typeKey ? await fetchTypeDisplayName(typeKey) : (m.type?.name || '-');
  return `
    <div style="font-weight:600;text-transform:capitalize">${moveName}</div>
    <div class="muted">Tipo: ${typeDisplay} — PP: ${m.pp ?? '-'} — Potencia: ${m.power ?? '-'} — Precisión: ${m.accuracy ?? '-'}</div>
    <div style="margin-top:6px">${effect}</div>
  `.trim();
}

function extractAbilityNumbers(effectText) {
  if (!effectText || typeof effectText !== 'string') return [];
  const values = [];
  const seen = new Set();
  (effectText.match(/\d+\.?\d*[×x]/gi) || []).forEach(m => { const n = m.replace(/x$/i, '×'); if (!seen.has(n)) { seen.add(n); values.push(n); } });
  (effectText.match(/\d+%/g) || []).forEach(m => { if (!seen.has(m)) { seen.add(m); values.push(m); } });
  (effectText.match(/\d+\/\d+/g) || []).forEach(m => { if (!seen.has(m)) { seen.add(m); values.push(m); } });
  if (values.length === 0) {
    const stageTurn = effectText.match(/(\d+)\s*(stage|turn|level)/gi);
    if (stageTurn) stageTurn.forEach(s => { const m = s.match(/\d+/); if (m && !seen.has(m[0])) { seen.add(m[0]); values.push(m[0]); } });
  }
  return values;
}

async function formatAbilityHtmlAsync(a) {
  const lang = getAppLang();
  let name, effect;
  if (lang === 'es') {
    name = (a.names || []).find(n => n.language?.name === 'es')?.name || a.name;
    effect = (a.effect_entries || []).find(e => e.language?.name === 'es')?.short_effect || (a.effect_entries || []).find(e => e.language?.name === 'es')?.effect
      || (a.flavor_text_entries || []).find(e => e.language?.name === 'es')?.flavor_text || '';
  } else {
    name = (a.names || []).find(n => n.language?.name === 'en')?.name || a.name;
    effect = (a.effect_entries || []).find(e => e.language?.name === 'en')?.short_effect || (a.effect_entries || []).find(e => e.language?.name === 'en')?.effect
      || (a.flavor_text_entries || []).find(e => e.language?.name === 'en')?.flavor_text || '';
  }
  if (!effect && (a.effect_entries || []).length) effect = a.effect_entries[0].short_effect || a.effect_entries[0].effect || '';
  if (!effect && (a.flavor_text_entries || []).length) effect = a.flavor_text_entries.find(e => e.language?.name === 'en')?.flavor_text || a.flavor_text_entries[0].flavor_text || '';
  const displayName = (name || a.name).replace(/-/g, ' ');
  const effectStr = (effect || '').replace(/\f/g, ' ');
  const numbers = extractAbilityNumbers(effectStr);
  const numbersLine = numbers.length > 0
    ? `<div class="muted" style="margin-top:4px;font-weight:600">${t('values')}: ${numbers.join(' · ')}</div>`
    : '';
  return `
    <div style="font-weight:600;text-transform:capitalize">${displayName}</div>
    ${numbersLine}
    <div style="margin-top:6px">${effectStr}</div>
  `.trim();
}

export function attachMoveHover(container) {
  const badges = container.querySelectorAll('.move-badge');
  badges.forEach(b => {
    const url = b.dataset.url;
    let mouseMoveHandler = (e) => showMoveTooltip(b.dataset.tip || 'Cargando...', e.clientX, e.clientY);
    b.addEventListener('mouseenter', async (ev) => {
      document.addEventListener('mousemove', mouseMoveHandler);
      if (moveCache[url]) {
        b.dataset.tip = await formatMoveHtmlAsync(moveCache[url]);
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
        return;
      }
      try {
        const m = await fetchJson(url);
        moveCache[url] = m;
        b.dataset.tip = await formatMoveHtmlAsync(m);
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
      } catch (_) {
        b.dataset.tip = 'No se pudo cargar información';
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
      }
    });
    b.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      hideMoveTooltip();
    });
  });
}

export function attachAbilityHover(container) {
  const badges = container.querySelectorAll('.ability-badge');
  badges.forEach(b => {
    const url = b.dataset.url;
    if (!url) return;
    let mouseMoveHandler = (e) => showMoveTooltip(b.dataset.tip || 'Cargando...', e.clientX, e.clientY);
    b.addEventListener('mouseenter', async (ev) => {
      document.addEventListener('mousemove', mouseMoveHandler);
      if (abilityCache[url]) {
        b.dataset.tip = await formatAbilityHtmlAsync(abilityCache[url]);
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
        return;
      }
      try {
        const a = await fetchJson(url);
        abilityCache[url] = a;
        b.dataset.tip = await formatAbilityHtmlAsync(a);
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
      } catch (_) {
        b.dataset.tip = 'No se pudo cargar información';
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
      }
    });
    b.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      hideMoveTooltip();
    });
  });
}
