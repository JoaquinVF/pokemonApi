/**
 * Filtros de búsqueda: tipos, fase, región, generación y sincronización con la URL.
 */

export const generationNames = {
  'generation-i': '1', 'generation-ii': '2', 'generation-iii': '3', 'generation-iv': '4',
  'generation-v': '5', 'generation-vi': '6', 'generation-vii': '7', 'generation-viii': '8', 'generation-ix': '9',
};

export const regionNames = {
  kanto: 'Kanto', 'original-johto': 'Johto', johto: 'Johto', hoenn: 'Hoenn', sinnoh: 'Sinnoh',
  'original-sinnoh': 'Sinnoh', 'extended-sinnoh': 'Sinnoh', unova: 'Unova', 'original-unova': 'Unova',
  'updated-unova': 'Unova', kalos: 'Kalos', 'kalos-central': 'Kalos', 'kalos-coastal': 'Kalos',
  'kalos-mountain': 'Kalos', alola: 'Alola', 'original-alola': 'Alola', 'updated-alola': 'Alola',
  galar: 'Galar', hisui: 'Hisui', paldea: 'Paldea', kitakami: 'Kitakami', national: 'Nacional',
};

/** Lee los filtros desde la query string. */
export function getFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  const typesStr = params.get('types') || '';
  return {
    types: typesStr ? typesStr.split(',').filter(Boolean) : [],
    phase: params.get('phase') || 'all',
    region: params.get('region') || 'all',
    generation: params.get('generation') || 'all',
    page: params.get('page') || '1',
  };
}

/** Construye la query string (?page=1&types=fire,water...) a partir de los filtros. */
export function buildQueryFromFilters(filters) {
  const p = new URLSearchParams();
  if (filters.page) p.set('page', String(filters.page));
  if (filters.types?.length) p.set('types', filters.types.join(','));
  if (filters.phase && filters.phase !== 'all') p.set('phase', filters.phase);
  if (filters.region && filters.region !== 'all') p.set('region', filters.region);
  if (filters.generation && filters.generation !== 'all') p.set('generation', filters.generation);
  const q = p.toString();
  return q ? '?' + q : '?page=1';
}

/** Lee los filtros desde los controles del formulario (checkboxes y selects). */
export function getFiltersFromDom() {
  const types = [];
  document.querySelectorAll('#filterTypesCheckboxes input[name="filterType"]:checked').forEach(cb => types.push(cb.value));
  return {
    types,
    phase: document.getElementById('filterPhaseSelect')?.value || 'all',
    region: document.getElementById('filterRegionSelect')?.value || 'all',
    generation: document.getElementById('filterGenerationSelect')?.value || 'all',
    page: '1',
  };
}

/** Sincroniza los controles del formulario con el objeto de filtros (p. ej. tras leer la URL). */
export function syncFiltersToUrl(filters) {
  document.querySelectorAll('#filterTypesCheckboxes input[name="filterType"]').forEach(cb => {
    cb.checked = (filters.types || []).includes(cb.value);
  });
  const phaseSel = document.getElementById('filterPhaseSelect');
  const regionSel = document.getElementById('filterRegionSelect');
  const genSel = document.getElementById('filterGenerationSelect');
  if (phaseSel) phaseSel.value = filters.phase || 'all';
  if (regionSel) regionSel.value = filters.region || 'all';
  if (genSel) genSel.value = filters.generation || 'all';
}
