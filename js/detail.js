/**
 * Página de detalle de un Pokémon: datos, estadísticas, evolución, tooltips.
 */

import { qs, API_BASE } from './config.js';
import { fetchJson, fetchTypeDisplayName, getPokemonWeaknesses, getPokemonResistances, getEvolutionChainWithDetails, getPokemonEncounters } from './api.js';
import { t, getStatTranslation, getAppLang, habitatNames, encounterMethodNames } from './translations.js';
import { attachMoveHover, attachAbilityHover } from './tooltips.js';

function formatLocationAreaName(name) {
  if (!name) return '';
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getEncounterMethodLabel(methodName) {
  const lang = getAppLang();
  return encounterMethodNames[methodName]?.[lang] || (methodName || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function loadDetail() {
  const name = qs('name', null);
  const container = document.getElementById('detail');
  const title = document.getElementById('pokemon-name');
  if (!name) {
    if (container) container.innerHTML = '<p>Falta nombre o id en la URL.</p>';
    return;
  }
  if (container) {
    container.innerHTML = `<div class="loading-detail" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <span>${t('loading')}</span>
    </div>`;
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

    const lang = getAppLang();
    const habitatKey = species.habitat?.name;
    const habitatDisplay = habitatKey ? (habitatNames[habitatKey]?.[lang] || formatLocationAreaName(habitatKey)) : null;

    const encounters = await getPokemonEncounters(p.location_area_encounters);
    const locationLines = [];
    const seen = new Set();
    for (const enc of encounters) {
      const areaName = enc.location_area?.name;
      const areaLabel = formatLocationAreaName(areaName || '');
      for (const vd of enc.version_details || []) {
        const versionName = vd.version?.name || '';
        const versionLabel = formatLocationAreaName(versionName);
        for (const ed of vd.encounter_details || []) {
          const methodName = ed.method?.name || '';
          const methodLabel = getEncounterMethodLabel(methodName);
          const minL = ed.min_level ?? '';
          const maxL = ed.max_level ?? '';
          const levelStr = minL && maxL ? (minL === maxL ? `${minL}` : `${minL}–${maxL}`) : (minL || maxL || '');
          const key = `${areaLabel}|${versionLabel}|${methodLabel}|${levelStr}`;
          if (key && !seen.has(key)) {
            seen.add(key);
            locationLines.push({ areaLabel, versionLabel, methodLabel, levelStr });
          }
        }
      }
    }

    const locationsGridHtml = locationLines.length > 0
      ? `<table class="detail-location-table" role="table">
          <thead><tr>
            <th scope="col">${t('locColArea')}</th>
            <th scope="col">${t('locColGame')}</th>
            <th scope="col">${t('locColForm')}</th>
            <th scope="col">${t('locColLevel')}</th>
          </tr></thead>
          <tbody>
            ${locationLines.map(({ areaLabel, versionLabel, methodLabel, levelStr }) =>
              `<tr><td>${areaLabel}</td><td>${versionLabel}</td><td>${methodLabel}</td><td>${levelStr || '—'}</td></tr>`
            ).join('')}
          </tbody>
        </table>`
      : '';

    const habitatHtml = habitatDisplay
      ? `<div class="mb-2"><strong>${t('habitat')}:</strong> ${habitatDisplay}</div>`
      : '';
    const locationsSectionHtml = (habitatHtml || locationsGridHtml) ? `
      <div class="detail-location-section mb-3">
        ${habitatHtml || ''}
        ${locationsGridHtml ? `<div class="${habitatDisplay ? 'mt-2' : ''}"><strong>${t('whereToFind')}:</strong><div class="detail-location-grid-wrap mt-1">${locationsGridHtml}</div></div>` : ''}
      </div>
    ` : '';

    const evolutionChainWithDetails = await getEvolutionChainWithDetails(p.id);
    let evolutionHtml = '';
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
    const carouselPrevSvg = '<svg class="detail-carousel-arrow" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
    const carouselNextSvg = '<svg class="detail-carousel-arrow" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    const initialSlides = [];
    if (sprite) initialSlides.push({ url: sprite, alt: capitalizedName, type: 'sprite' });
    if (spriteShiny) initialSlides.push({ url: spriteShiny, alt: `${capitalizedName} (${t('shiny')})`, type: 'shiny' });
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
    const cap = s => (s && s.length) ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
const movesBadgesHtml = p.moves.slice(0, 12).map(m => `<span class="badge bg-secondary me-2 mb-2 move-badge" data-url="${m.move.url}">${(m.move.name || '').split(/[\s-]+/).map(cap).join(' ')}</span>`).join('');

    if (!container) return;
    container.innerHTML = `
      <div class="detail-card">
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
              <div class="detail-carousel">
                ${initialSlides.length > 0 ? `<img id="detailCarouselImage" src="${initialSlides[0].url}" alt="${initialSlides[0].alt}" class="detail-sprite detail-carousel-img">` : ''}
                <button type="button" class="btn btn-sm detail-carousel-prev" id="carouselPrevBtn" aria-label="${t('prev')}" title="${t('prev')}">${carouselPrevSvg}</button>
                <button type="button" class="btn btn-sm detail-carousel-next" id="carouselNextBtn" aria-label="${t('next')}" title="${t('next')}">${carouselNextSvg}</button>
                <div class="detail-carousel-dots" id="carouselDots" role="tablist" aria-label="Slides"></div>
              </div>
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
          <div class="detail-cell">
            <strong>${t('moves')}:</strong>
            <div class="mt-2">${movesBadgesHtml}</div>
          </div>
          <div class="detail-cell detail-cell-height"><strong>${t('height')}:</strong> ${p.height / 10} ${t('m')}</div>
          <div class="detail-cell detail-cell-weight"><strong>${t('weight')}:</strong> ${p.weight / 10} ${t('kg')}</div>
          ${locationsSectionHtml ? `<div class="detail-cell detail-location-full">${locationsSectionHtml}</div>` : ''}
          ${evolutionHtml ? `<div class="detail-cell detail-evolution-full">${evolutionHtml}</div>` : ''}
          </div>
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

    const carouselImg = document.getElementById('detailCarouselImage');
    const carouselPrevBtn = document.getElementById('carouselPrevBtn');
    const carouselNextBtn = document.getElementById('carouselNextBtn');
    const shinyBtn = document.getElementById('shinyToggleBtn');
    const slides = [...initialSlides];
    let currentIndex = 0;

    const carouselDotsEl = document.getElementById('carouselDots');
    function updateCarouselDots() {
      if (!carouselDotsEl || slides.length <= 1) {
        if (carouselDotsEl) carouselDotsEl.innerHTML = '';
        return;
      }
      carouselDotsEl.innerHTML = slides.map((_, i) =>
        `<button type="button" class="detail-carousel-dot ${i === currentIndex ? 'detail-carousel-dot--active' : ''}" role="tab" aria-selected="${i === currentIndex}" aria-label="${i + 1} ${t('of')} ${slides.length}" data-index="${i}"></button>`
      ).join('');
      carouselDotsEl.querySelectorAll('.detail-carousel-dot').forEach((btn, i) => {
        btn.addEventListener('click', () => showSlide(i));
      });
    }
    function showSlide(index) {
      if (!carouselImg || slides.length === 0) return;
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      currentIndex = index;
      const slide = slides[currentIndex];
      carouselImg.src = slide.url;
      carouselImg.alt = slide.alt;
      if (carouselPrevBtn) carouselPrevBtn.disabled = slides.length <= 1;
      if (carouselNextBtn) carouselNextBtn.disabled = slides.length <= 1;
      if (carouselPrevBtn) carouselPrevBtn.style.visibility = slides.length <= 1 ? 'hidden' : 'visible';
      if (carouselNextBtn) carouselNextBtn.style.visibility = slides.length <= 1 ? 'hidden' : 'visible';
      if (shinyBtn && spriteShiny) {
        const onShinySlide = slide.type === 'shiny';
        shinyBtn.setAttribute('aria-pressed', onShinySlide ? 'true' : 'false');
        shinyBtn.setAttribute('aria-label', onShinySlide ? t('normal') : t('shiny'));
        shinyBtn.setAttribute('title', onShinySlide ? t('normal') : t('shiny'));
        shinyBtn.classList.toggle('detail-shiny-btn--active', onShinySlide);
      }
      updateCarouselDots();
    }

    if (carouselPrevBtn) {
      carouselPrevBtn.addEventListener('click', () => { showSlide(currentIndex - 1); });
      carouselPrevBtn.disabled = slides.length <= 1;
      carouselPrevBtn.style.visibility = slides.length <= 1 ? 'hidden' : 'visible';
    }
    if (carouselNextBtn) {
      carouselNextBtn.addEventListener('click', () => { showSlide(currentIndex + 1); });
      carouselNextBtn.disabled = slides.length <= 1;
      carouselNextBtn.style.visibility = slides.length <= 1 ? 'hidden' : 'visible';
    }
    if (shinyBtn && spriteShiny && slides.length >= 2) {
      shinyBtn.addEventListener('click', () => {
        const onShiny = currentIndex === 1;
        showSlide(onShiny ? 0 : 1);
      });
    }

    updateCarouselDots();

    try { attachMoveHover(container); } catch (e) { /* no-op */ }
    try { attachAbilityHover(container); } catch (e) { /* no-op */ }
  } catch (e) {
    if (container) container.innerHTML = `<p>${t('errorDetail')}: ${e.message}</p>`;
  }
}
