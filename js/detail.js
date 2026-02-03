/**
 * Página de detalle de un Pokémon: datos, estadísticas, evolución, tooltips.
 */

import { qs, API_BASE } from './config.js';
import { fetchJson, fetchTypeDisplayName, getPokemonWeaknesses, getPokemonResistances, getEvolutionChainWithDetails } from './api.js';
import { t, getStatTranslation, getAppLang } from './translations.js';
import { attachMoveHover, attachAbilityHover } from './tooltips.js';

export async function loadDetail() {
  const name = qs('name', null);
  const container = document.getElementById('detail');
  const title = document.getElementById('pokemon-name');
  if (!name) {
    if (container) container.innerHTML = '<p>Falta nombre o id en la URL.</p>';
    return;
  }
  try {
    const p = await fetchJson(`${API_BASE}/pokemon/${name}`);
    const capitalizedName = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    if (title) title.textContent = `#${p.id} ${capitalizedName}`;
    const sprite = p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '';
    const spriteShiny = p.sprites?.other?.['official-artwork']?.front_shiny || p.sprites?.front_shiny || '';
    const abilitiesHtml = p.abilities.map(a =>
      `<span class="badge bg-secondary me-2 mb-2 ability-badge" data-url="${a.ability.url}">${a.ability.name.replace(/-/g, ' ')}${a.is_hidden ? ' <span class="ability-hidden">(Hidden)</span>' : ''}</span>`
    ).join('');

    const weaknesses = await getPokemonWeaknesses(p.types);
    const weaknessHtml = weaknesses.length > 0 ? `
      <div class="mb-3">
        <strong>${t('weakness')}:</strong>
        <div class="mt-2">
          ${(await Promise.all(weaknesses.map(async w => `
            <span class="badge" style="background:var(--${w.type})">
              ${await fetchTypeDisplayName(w.type)}
              x${w.multiplier}
            </span>
          `))).join(' ')}
        </div>
      </div>
    ` : '';

    const resistances = await getPokemonResistances(p.types);
    const resistanceHtml = resistances.length > 0 ? `
      <div class="mb-3">
        <strong>${t('resistance')}:</strong>
        <div class="mt-2">
          ${(await Promise.all(resistances.map(async r => `
            <span class="badge" style="background:var(--${r.type})">
              ${await fetchTypeDisplayName(r.type)}
              ${r.multiplier === 0 ? t('immune') : `x${r.multiplier}`}
            </span>
          `))).join(' ')}
        </div>
      </div>
    ` : '';

    const params = new URLSearchParams(location.search);
    params.delete('name');
    const returnQuery = params.toString() ? '&' + params.toString() : '';

    const species = await fetchJson(p.species.url);
    const tagParts = [];
    if (species.is_legendary) tagParts.push(`<span class="detail-tag detail-tag-legendary">${t('legendary')}</span>`);
    if (species.is_mythical) tagParts.push(`<span class="detail-tag detail-tag-mythical">${t('mythical')}</span>`);
    if (species.is_baby) tagParts.push(`<span class="detail-tag detail-tag-baby">${t('baby')}</span>`);

    const evolutionChainWithDetails = await getEvolutionChainWithDetails(p.id);
    let evolutionHtml = '';
    const lang = getAppLang();
    if (evolutionChainWithDetails.length > 1) {
      const evoCards = await Promise.all(
        evolutionChainWithDetails.map(async (evo, index) => {
          const evoData = await fetchJson(`${API_BASE}/pokemon/${evo.name}`);
          const evoSprite = evoData.sprites.front_default;
          const displayName = evo.name.charAt(0).toUpperCase() + evo.name.slice(1);
          let methodText = '';
          if (index === 0) {
            methodText = lang === 'es' ? 'Forma base' : 'Base form';
          } else {
            const e = evo;
            const parts = [];
            if (e.trigger === 'level-up' && (e.minLevel || e.minHappiness)) {
              if (e.minLevel) parts.push(lang === 'es' ? `Nivel ${e.minLevel}` : `Level ${e.minLevel}`);
              if (e.minHappiness) parts.push(`${t('happiness')} ${e.minHappiness}`);
            } else if (e.trigger === 'level-up') {
              parts.push(t('levelUp'));
            }
            if (e.item) parts.push((e.item.replace(/-/g, ' ')).replace(/\b\w/g, c => c.toUpperCase()));
            if (e.trigger === 'trade') parts.push(t('trade'));
            if (e.minAffection) parts.push(lang === 'es' ? `Cariño ${e.minAffection}` : `Affection ${e.minAffection}`);
            methodText = parts.length ? parts.join(' · ') : (index === evolutionChainWithDetails.length - 1 ? (lang === 'es' ? 'Evolución final' : 'Final evolution') : '—');
          }
          return `
            <div class="text-center evo-step">
              <div class="evo-card" style="cursor:pointer" onclick="location.href='detail.html?name=${evo.name}${returnQuery}'">
                <img src="${evoSprite}" alt="${displayName}">
                <div class="evo-name">${displayName}</div>
              </div>
              <div class="evo-level">${methodText}</div>
            </div>
            ${index < evolutionChainWithDetails.length - 1 ? '<div class="evo-arrow">→</div>' : ''}
          `;
        })
      );
      evolutionHtml = `
        <div class="detail-evolution-section">
          <h4 class="h6 mb-2">${t('evolution')}</h4>
          <div class="detail-evolution-cards d-flex align-items-center gap-3 mt-2 flex-wrap justify-content-center">
            ${evoCards.join('')}
          </div>
        </div>
      `;
    }

    let hasCry = false;
    try {
      const cryRes = await fetch(`cries/pokemon/latest/${p.id}.ogg`, { method: 'HEAD' });
      hasCry = cryRes.ok;
    } catch (_) {}
    const shinyIconHtml = '<img src="shiny-stars.png" class="detail-shiny-icon" alt="">';
    const cryIconSvg = '<svg class="detail-cry-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15 10a3 3 0 0 1 0 4M18 9a4 4 0 0 1 0 6"/></svg>';
    const typesBadgesHtml = (await Promise.all(p.types.map(async (ty) => `<span class="badge" style="background:var(--${ty.type.name})">${await fetchTypeDisplayName(ty.type.name)}</span>`))).join(' ');
    const statsBlocksHtml = p.stats.map(s => `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <strong>${getStatTranslation(s.stat.name)}</strong>
          <span>${s.base_stat}</span>
        </div>
        <div class="progress">
          <div class="progress-bar" style="width:${(s.base_stat / 150) * 100}%"></div>
        </div>
      </div>
    `).join('');
    const movesBadgesHtml = p.moves.slice(0, 12).map(m => `<span class="badge bg-secondary me-2 mb-2 move-badge" data-url="${m.move.url}">${m.move.name}</span>`).join('');

    if (!container) return;
    container.innerHTML = `
      <div class="detail-card-inner">
        <div class="detail-grid">
          <div class="detail-cell detail-row1-left">
            ${tagParts.length > 0 ? `<div class="detail-tags">${tagParts.join(' ')}</div>` : ''}
          </div>
          <div class="detail-cell detail-row1-right">
            <h2 class="detail-title">${t('pokemonInfo')}</h2>
          </div>
          <div class="detail-cell detail-row2-left detail-image-container">
            <div class="detail-image-wrap">
              ${sprite ? `<img id="detailPokemonSprite" src="${sprite}" alt="${p.name}" class="detail-sprite">` : ''}
              ${hasCry ? `<button type="button" class="btn btn-sm detail-cry-btn" id="cryBtn" data-pokemon-id="${p.id}" aria-label="${t('playCry')}" title="${t('playCry')}">${cryIconSvg}</button>` : ''}
              ${spriteShiny ? `<button type="button" class="btn btn-sm detail-shiny-btn" id="shinyToggleBtn" aria-pressed="false" aria-label="${t('shiny')}" title="${t('shiny')}">${shinyIconHtml}</button>` : ''}
            </div>
          </div>
          <div class="detail-cell detail-row2-right">
            <h4 class="h6 mb-2">${t('baseStats')}</h4>
            ${statsBlocksHtml}
          </div>
          <div class="detail-cell detail-row3-left">
            <strong>${t('types')}:</strong>
            <div class="mt-2">${typesBadgesHtml}</div>
          </div>
          <div class="detail-cell detail-resistance-cell">
            ${resistanceHtml || `<strong>${t('resistance')}:</strong> —`}
          </div>
          <div class="detail-cell detail-row4-left">
            ${weaknessHtml || `<strong>${t('weakness')}:</strong> —`}
          </div>
          <div class="detail-cell">
            <strong>${t('abilities')}:</strong>
            <div class="mt-2 ability-badges-wrap">${abilitiesHtml}</div>
          </div>
          <div class="detail-cell"><strong>${t('height')}:</strong> ${p.height / 10} ${t('m')}</div>
          <div class="detail-cell">
            <strong>${t('moves')}:</strong>
            <div class="mt-2">${movesBadgesHtml}</div>
          </div>
          <div class="detail-cell"><strong>${t('weight')}:</strong> ${p.weight / 10} ${t('kg')}</div>
          ${evolutionHtml ? `<div class="detail-cell detail-evolution-full">${evolutionHtml}</div>` : ''}
        </div>
      </div>
    `;

    const cryBtn = document.getElementById('cryBtn');
    if (cryBtn) {
      cryBtn.addEventListener('click', () => {
        const id = cryBtn.getAttribute('data-pokemon-id');
        if (!id) return;
        const audio = new Audio(`cries/pokemon/latest/${id}.ogg`);
        audio.play().catch(() => {});
      });
    }
    if (spriteShiny) {
      const shinyBtn = document.getElementById('shinyToggleBtn');
      const detailImg = document.getElementById('detailPokemonSprite');
      if (shinyBtn && detailImg) {
        shinyBtn.addEventListener('click', () => {
          const isShiny = shinyBtn.getAttribute('aria-pressed') === 'true';
          if (isShiny) {
            detailImg.src = sprite;
            shinyBtn.setAttribute('aria-label', t('shiny'));
            shinyBtn.setAttribute('title', t('shiny'));
            shinyBtn.setAttribute('aria-pressed', 'false');
            shinyBtn.classList.remove('detail-shiny-btn--active');
          } else {
            detailImg.src = spriteShiny;
            shinyBtn.setAttribute('aria-label', t('normal'));
            shinyBtn.setAttribute('title', t('normal'));
            shinyBtn.setAttribute('aria-pressed', 'true');
            shinyBtn.classList.add('detail-shiny-btn--active');
          }
        });
      }
    }
    try { attachMoveHover(container); } catch (e) { /* no-op */ }
    try { attachAbilityHover(container); } catch (e) { /* no-op */ }
  } catch (e) {
    if (container) container.innerHTML = `<p>${t('errorDetail')}: ${e.message}</p>`;
  }
}
