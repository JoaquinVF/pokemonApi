/**
 * Punto de entrada: detecta idioma, actualiza textos, inicia listado o detalle según la página.
 */

import { setAppLang, t } from './translations.js';
import { getFiltersFromUrl, syncFiltersToUrl } from './filters.js';
import { loadList, updateActiveFilterLabel } from './list.js';
import { loadDetail } from './detail.js';
import { initSearchAndFilters, loadTypes, loadGenerations, loadRegions } from './search.js';

document.addEventListener('DOMContentLoaded', () => {
  const browserLang = navigator.language || navigator.userLanguage || 'es';
  setAppLang(browserLang.startsWith('en') ? 'en' : 'es');

  const footerEl = document.getElementById('footer-text');
  if (footerEl) footerEl.textContent = t('webCreatedBy');
  const footerApi = document.getElementById('footer-api');
  if (footerApi) footerApi.innerHTML = `${t('apiUsed')} <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" class="text-white-50 text-decoration-none">https://pokeapi.co/</a>`;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.querySelector('#searchForm button');
  const advancedBtn = document.getElementById('advancedSearchBtn');
  if (prevBtn) prevBtn.textContent = t('prev');
  if (nextBtn) nextBtn.textContent = t('next');
  if (searchInput) searchInput.placeholder = t('search');
  if (searchBtn) searchBtn.textContent = t('searchBtn');
  if (advancedBtn) advancedBtn.textContent = t('advancedSearch');

  if (document.getElementById('pokemon-list')) {
    initSearchAndFilters();
    loadTypes();
    loadGenerations();
    loadRegions();
    syncFiltersToUrl(getFiltersFromUrl());
    loadList();
  }

  if (document.getElementById('detail')) {
    loadDetail();
    const backLink = document.getElementById('backLink');
    if (backLink) {
      const params = new URLSearchParams(location.search);
      params.delete('name');
      backLink.href = 'index.html?' + params.toString();
    }
  }

  window.addEventListener('popstate', () => {
    if (document.getElementById('pokemon-list')) {
      const filters = getFiltersFromUrl();
      syncFiltersToUrl(filters);
      updateActiveFilterLabel(filters);
      loadList();
    }
  });
});
