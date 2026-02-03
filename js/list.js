/**
 * Página de listado: tarjetas de Pokémon, paginación y carga de datos según filtros.
 */

import { API_BASE, LIMIT } from './config.js';
import { fetchJson, fetchTypeDisplayName, getSpeciesEvolutionStage } from './api.js';
import { getFiltersFromUrl, buildQueryFromFilters, syncFiltersToUrl, generationNames, regionNames } from './filters.js';
import { t, typeTranslations, getAppLang } from './translations.js';

let currentDetails = [];

async function renderCards(list) {
  const wrap = document.getElementById('pokemon-list');
  if (!wrap) return;
  const filters = getFiltersFromUrl();
  const returnQuery = buildQueryFromFilters(filters);
  wrap.innerHTML = '';
  for (const pokemon of list) {
    if (!pokemon) continue;
    const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
    const typesArr = await Promise.all(pokemon.types.map(async (ty) => {
      const disp = await fetchTypeDisplayName(ty.type.name);
      return `<span class="type" data-type="${ty.type.name}">${disp}</span>`;
    }));
    const typesHtml = typesArr.join(' ');
    const card = document.createElement('article');
    card.className = 'card';
    card.addEventListener('click', () => {
      location.href = `detail.html?name=${pokemon.name}${returnQuery !== '?page=1' ? '&' + returnQuery.slice(1) : ''}`;
    });
    const img = document.createElement('div');
    img.className = 'sprite';
    img.innerHTML = spriteUrl ? `<img src="${spriteUrl}" alt="${pokemon.name}" loading="lazy" style="max-width:100%;height:auto;">` : '';
    const title = document.createElement('div');
    title.className = 'pokemon-name';
    title.textContent = `#${pokemon.id}`;
    const name = document.createElement('div');
    name.style.fontSize = '0.9rem';
    name.style.fontWeight = '600';
    name.style.color = '#111';
    name.style.textTransform = 'capitalize';
    name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = typesHtml;
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(name);
    card.appendChild(meta);
    wrap.appendChild(card);
  }
}

function getPageNumbersToShow(currentPage, totalPages) {
  if (totalPages <= 0) return [];
  if (totalPages <= 9) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const delta = 3;
  let start = Math.max(1, currentPage - delta);
  let end = Math.min(totalPages, currentPage + delta);
  if (end - start < 2 * delta) {
    if (start === 1) end = Math.min(totalPages, start + 2 * delta);
    else end = Math.min(totalPages, end);
    if (end === totalPages) start = Math.max(1, end - 2 * delta);
  }
  const pages = new Set([1]);
  for (let i = start; i <= end; i++) pages.add(i);
  if (totalPages > 1) pages.add(totalPages);
  return Array.from(pages).sort((a, b) => a - b);
}

function renderPageNumbers(currentPage, totalPages, basePageParam) {
  const container = document.getElementById('pageNumbers');
  if (!container) return;
  container.innerHTML = '';
  if (totalPages <= 1) return;
  const pages = getPageNumbersToShow(currentPage, totalPages);
  let prevNum = 0;
  for (const num of pages) {
    if (prevNum > 0 && num - prevNum > 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'page-ellipsis px-2';
      ellipsis.setAttribute('aria-hidden', 'true');
      ellipsis.textContent = '…';
      container.appendChild(ellipsis);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = num === currentPage ? 'btn btn-primary page-num' : 'btn btn-outline-primary page-num';
    btn.textContent = num;
    btn.setAttribute('aria-label', `${t('pageTitle')} ${num}`);
    if (num === currentPage) btn.setAttribute('aria-current', 'page');
    btn.onclick = () => {
      history.pushState({}, '', basePageParam(num));
      const filters = getFiltersFromUrl();
      filters.page = String(num);
      loadList({ ...filters, page: String(num) });
    };
    container.appendChild(btn);
    prevNum = num;
  }
}

export async function loadList(filtersArg) {
  const filters = filtersArg || getFiltersFromUrl();
  const page = Number(filters.page || '1');
  const offset = (page - 1) * LIMIT;
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const types = filters.types || [];
  const phase = filters.phase || 'all';
  const region = filters.region || 'all';
  const generation = filters.generation || 'all';

  try {
    let allPokemonRefs = [];
    if (generation !== 'all') {
      const genData = await fetchJson(`${API_BASE}/generation/${generation}`);
      allPokemonRefs = (genData.pokemon_species || []).map(s => ({ name: s.name, speciesUrl: s.url }));
    } else if (region !== 'all') {
      const pokedexData = await fetchJson(`${API_BASE}/pokedex/${region}`);
      const entries = (pokedexData.pokemon_entries || []).map(e => ({ name: e.pokemon_species.name, speciesUrl: e.pokemon_species.url }));
      allPokemonRefs = entries;
    } else {
      const data = await fetchJson(`${API_BASE}/pokemon?limit=2000`);
      allPokemonRefs = (data.results || []).map(r => ({ name: r.name, url: r.url }));
    }

    let listToFilter = allPokemonRefs;
    if (types.length > 0 && allPokemonRefs.length > 0) {
      const typeSets = await Promise.all(types.map(tName => fetchJson(`${API_BASE}/type/${tName}`).then(d => new Set((d.pokemon || []).map(p => p.pokemon.name)))));
      const hasAllTypes = (name) => typeSets.every(set => set.has(name));
      const getName = (ref) => ref.name || (ref.url && ref.url.split('/').filter(Boolean).pop());
      listToFilter = allPokemonRefs.filter(ref => hasAllTypes(getName(ref)));
    }

    let afterPhase = listToFilter;
    if (phase !== 'all' && listToFilter.length > 0) {
      const getName = (r) => r.name || (r.url && r.url.split('/').filter(Boolean).pop());
      const names = listToFilter.map(getName).filter(Boolean);
      if (names.length > 0) {
        const stages = await Promise.all(names.map(n => getSpeciesEvolutionStage(n)));
        const keep = new Set(names.filter((_, i) => stages[i] === phase));
        afterPhase = listToFilter.filter(r => keep.has(getName(r)));
      }
    }

    const total = afterPhase.length;
    const sliceRefs = afterPhase.slice(offset, offset + LIMIT);
    currentDetails = await Promise.all(
      sliceRefs.map(ref => {
        const url = ref.url || `${API_BASE}/pokemon/${ref.name}`;
        return fetchJson(url).catch(() => null);
      })
    );

    if (pageInfo) pageInfo.textContent = `${t('pageTitle')} ${page} — ${offset + 1}–${Math.min(offset + LIMIT, total)} ${t('of')} ${total}`;
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = offset + LIMIT >= total;

    await renderCards(currentDetails.filter(Boolean));
    updateActiveFilterLabel(filters);

    const basePageParam = (n) => buildQueryFromFilters({ ...filters, page: String(n) });
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));
    renderPageNumbers(page, totalPages, basePageParam);

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (page > 1) {
          history.pushState({}, '', basePageParam(page - 1));
          loadList({ ...filters, page: String(page - 1) });
        }
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        history.pushState({}, '', basePageParam(page + 1));
        loadList({ ...filters, page: String(page + 1) });
      };
    }
  } catch (e) {
    const wrap = document.getElementById('pokemon-list');
    if (wrap) wrap.innerHTML = `<p>${t('error')}: ${e.message}</p>`;
  }
}

export function updateActiveFilterLabel(filters) {
  const el = document.getElementById('activeFilter');
  if (!el) return;
  const parts = [];
  if (filters.types?.length) parts.push(t('filterByTypes') + ': ' + filters.types.map(ty => (typeTranslations[ty]?.[getAppLang()] || ty)).join(', '));
  if (filters.phase && filters.phase !== 'all') parts.push(t('filterByPhase') + ': ' + (filters.phase === 'baby' ? t('phaseBaby') : filters.phase === 'base' ? t('phaseBase') : filters.phase === 'stage1' ? t('phaseStage1') : t('phaseStage2')));
  if (filters.region && filters.region !== 'all') parts.push(t('filterByRegion') + ': ' + (regionNames[filters.region] || filters.region));
  if (filters.generation && filters.generation !== 'all') parts.push(t('filterByGeneration') + ': ' + (generationNames[filters.generation] || filters.generation));
  if (parts.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `<div class="badge bg-info text-dark">${t('activeFilter')}: ${parts.join(' · ')}</div> <button id="clearFilter" class="btn btn-sm btn-link">${t('clearFilter')}</button>`;
  const btn = document.getElementById('clearFilter');
  const emptyFilters = { types: [], phase: 'all', region: 'all', generation: 'all', page: '1' };
  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState({}, '', '?page=1');
    syncFiltersToUrl(emptyFilters);
    loadList(emptyFilters);
  });
}
