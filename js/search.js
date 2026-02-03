/**
 * Búsqueda por nombre, sugerencias, filtros avanzados (tipos, fase, región, generación) y toasts.
 */

import { API_BASE } from './config.js';
import { fetchJson } from './api.js';
import { getFiltersFromUrl, buildQueryFromFilters, getFiltersFromDom, syncFiltersToUrl, generationNames, regionNames } from './filters.js';
import { t, typeTranslations, getAppLang } from './translations.js';
import { loadList } from './list.js';

export function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function initSearchAndFilters() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const suggestionsDiv = document.getElementById('searchSuggestions');
  let suggestionTimeout;
  let currentSuggestionIndex = -1;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    try {
      await fetchJson(`${API_BASE}/pokemon/${q}`);
      const filters = getFiltersFromUrl();
      const query = buildQueryFromFilters(filters);
      location.href = `detail.html?name=${q}${query !== '?page=1' ? '&' + query.slice(1) : '&page=1'}`;
    } catch (_) {
      showErrorToast(t('notFound'));
    }
  });

  input?.addEventListener('input', async (e) => {
    clearTimeout(suggestionTimeout);
    const q = e.target.value.trim().toLowerCase();
    currentSuggestionIndex = -1;
    if (!q) {
      if (suggestionsDiv) suggestionsDiv.innerHTML = '';
      return;
    }
    suggestionTimeout = setTimeout(async () => {
      try {
        const data = await fetchJson(`${API_BASE}/pokemon?limit=1000`);
        const matches = data.results.filter(p => p.name.includes(q)).slice(0, 8);
        if (matches.length === 0) {
          suggestionsDiv.innerHTML = `<div class="suggestion-item no-results">${t('noResults')}</div>`;
          return;
        }
        const filters = getFiltersFromUrl();
        const query = buildQueryFromFilters(filters);
        const queryStr = query !== '?page=1' ? '&' + query.slice(1) : '&page=1';
        suggestionsDiv.innerHTML = matches.map((p, idx) => `
          <div class="suggestion-item" data-index="${idx}" onclick="location.href='detail.html?name=${p.name}${queryStr}'">
            <div class="suggestion-name">${p.name}</div>
          </div>
        `).join('');
      } catch (e) {
        suggestionsDiv.innerHTML = `<div class="suggestion-item no-results">${t('errorLoading')}</div>`;
      }
    }, 300);
  });

  function highlightSuggestion(index) {
    if (!suggestionsDiv) return;
    const items = suggestionsDiv.querySelectorAll('.suggestion-item:not(.no-results)');
    items.forEach((item, idx) => item.classList.toggle('highlighted', idx === index));
    if (index >= 0 && items[index]) items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  input?.addEventListener('keydown', (e) => {
    if (!suggestionsDiv) return;
    const items = suggestionsDiv.querySelectorAll('.suggestion-item:not(.no-results)');
    if (items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, items.length - 1);
      highlightSuggestion(currentSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
      highlightSuggestion(currentSuggestionIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = currentSuggestionIndex >= 0 ? currentSuggestionIndex : 0;
      items[idx].click();
    }
  });

  input?.addEventListener('blur', () => {
    setTimeout(() => { if (suggestionsDiv) suggestionsDiv.innerHTML = ''; }, 200);
  });

  const advancedBtn = document.getElementById('advancedSearchBtn');
  const accordionEl = document.getElementById('advancedSearchAccordion');
  if (advancedBtn && accordionEl) {
    advancedBtn.addEventListener('click', () => {
      const expanded = accordionEl.classList.toggle('show');
      advancedBtn.setAttribute('aria-expanded', expanded);
    });
  }
  const applyBtn = document.getElementById('applyFiltersBtn');
  const clearBtn = document.getElementById('clearFiltersBtn');
  if (applyBtn) applyBtn.textContent = t('applyFilters');
  if (clearBtn) clearBtn.textContent = t('clearFilters');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const filters = getFiltersFromDom();
      history.pushState({}, '', buildQueryFromFilters(filters));
      syncFiltersToUrl(filters);
      loadList(filters);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const empty = { types: [], phase: 'all', region: 'all', generation: 'all', page: '1' };
      history.pushState({}, '', '?page=1');
      syncFiltersToUrl(empty);
      loadList(empty);
    });
  }
}

export async function loadTypes() {
  try {
    const data = await fetchJson(`${API_BASE}/type`);
    const wrap = document.getElementById('filterTypesCheckboxes');
    if (!wrap) return;
    wrap.innerHTML = '';
    const lang = getAppLang();
    data.results.forEach(ty => {
      const label = document.createElement('label');
      label.className = 'd-inline-block me-3 mb-1';
      const translated = typeTranslations[ty.name]?.[lang] || ty.name;
      const display = translated.charAt(0).toUpperCase() + translated.slice(1);
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = 'filterType';
      cb.value = ty.name;
      cb.className = 'form-check-input me-1';
      label.appendChild(cb);
      label.appendChild(document.createTextNode(display));
      wrap.appendChild(label);
    });
  } catch (e) {
    console.warn('No se pudieron cargar tipos', e);
  }
}

export async function loadGenerations() {
  try {
    const data = await fetchJson(`${API_BASE}/generation`);
    const select = document.getElementById('filterGenerationSelect');
    if (!select) return;
    const lang = getAppLang();
    data.results.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      const num = generationNames[g.name] || g.name;
      opt.textContent = lang === 'es' ? `Generación ${num}` : `Generation ${num}`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.warn('No se pudieron cargar generaciones', e);
  }
}

export async function loadRegions() {
  try {
    const data = await fetchJson(`${API_BASE}/pokedex?limit=30`);
    const select = document.getElementById('filterRegionSelect');
    if (!select) return;
    const mainRegions = ['kanto', 'original-johto', 'hoenn', 'original-sinnoh', 'original-unova', 'kalos-central', 'original-alola', 'galar', 'hisui', 'paldea'];
    const seen = new Set();
    data.results.forEach(r => {
      const name = r.name;
      if (mainRegions.includes(name) || (!seen.has(regionNames[name] || name) && !name.includes('updated') && name !== 'national')) {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = regionNames[name] || name.replace(/-/g, ' ');
        select.appendChild(opt);
        seen.add(opt.textContent);
      }
    });
  } catch (e) {
    console.warn('No se pudieron cargar regiones', e);
  }
}
