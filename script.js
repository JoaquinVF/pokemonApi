const API_BASE = 'https://pokeapi.co/api/v2';
const LIMIT = 50;

// Language detection and UI translations
let appLang = 'es'; // default to Spanish
const typeTranslations = {
  normal: { es: 'Normal', en: 'Normal' },
  fighting: { es: 'Lucha', en: 'Fighting' },
  flying: { es: 'Volador', en: 'Flying' },
  poison: { es: 'Veneno', en: 'Poison' },
  ground: { es: 'Tierra', en: 'Ground' },
  rock: { es: 'Roca', en: 'Rock' },
  bug: { es: 'Bicho', en: 'Bug' },
  ghost: { es: 'Fantasma', en: 'Ghost' },
  steel: { es: 'Acero', en: 'Steel' },
  fire: { es: 'Fuego', en: 'Fire' },
  water: { es: 'Agua', en: 'Water' },
  grass: { es: 'Planta', en: 'Grass' },
  electric: { es: 'Eléctrico', en: 'Electric' },
  psychic: { es: 'Psíquico', en: 'Psychic' },
  ice: { es: 'Hielo', en: 'Ice' },
  dragon: { es: 'Dragón', en: 'Dragon' },
  dark: { es: 'Siniestro', en: 'Dark' },
  fairy: { es: 'Hada', en: 'Fairy' },
};
const statTranslations = {
  hp: { es: 'PS', en: 'HP' },
  attack: { es: 'Ataque', en: 'Attack' },
  defense: { es: 'Defensa', en: 'Defense' },
  'special-attack': { es: 'Ataque Esp.', en: 'Sp. Atk' },
  'special-defense': { es: 'Defensa Esp.', en: 'Sp. Def' },
  speed: { es: 'Velocidad', en: 'Speed' },
};
const translations = {
  es: {
    pageTitle: 'Página',
    of: 'de',
    all: 'Todos los tipos',
    search: 'Buscar por nombre (ej. pikachu)',
    searchBtn: 'Buscar',
    filterBtn: 'Filtrar por tipo',
    activeFilter: 'Filtro activo',
    clearFilter: '(limpiar)',
    prev: 'Anterior',
    next: 'Siguiente',
    notFound: 'No se encontró ese Pokémon. Prueba con el nombre exacto en inglés.',
    noResults: 'No hay resultados',
    height: 'Altura',
    weight: 'Peso',
    m: 'm',
    kg: 'kg',
    types: 'Tipos',
    abilities: 'Habilidades',
    baseStats: 'Estadísticas Base',
    moves: 'Movimientos (algunos)',
    back: '← Volver',
    loading: 'Cargando...',
    error: 'Error cargando pokemones',
    errorDetail: 'Error cargando detalle',
    errorLoading: 'Error cargando información',
    type: 'Tipo',
    power: 'Potencia',
    accuracy: 'Precisión',
    pp: 'PP',
    pokemonInfo: 'Información del Pokémon',
    webCreatedBy: 'Web creada por Joaquin L. Villanueva Farber',
    apiUsed: 'API usada',
    weakness: 'Debilidad',
    resistance: 'Resistencia',
    immune: 'Inmune',
    evolution: 'Evolución',
    shiny: 'Shiny',
    normal: 'Normal',
    playCry: 'Reproducir grito',
    advancedSearch: 'Búsqueda avanzada',
    filterByTypes: 'Filtro por tipos (selección múltiple)',
    filterByPhase: 'Filtro por fase',
    filterByRegion: 'Filtro por región',
    filterByGeneration: 'Filtro por generación',
    allPhases: 'Todas',
    phaseBaby: 'Bebé',
    phaseBase: 'Base',
    phaseStage1: 'Etapa 1',
    phaseStage2: 'Etapa 2 (evolución final)',
    allRegions: 'Todas',
    allGenerations: 'Todas',
    applyFilters: 'Aplicar filtros',
    clearFilters: 'Limpiar',
    legendary: 'Legendario',
    mythical: 'Mítico',
    baby: 'Bebé',
    levelUp: 'Subir de nivel',
    useItem: 'Usar objeto',
    trade: 'Intercambio',
    happiness: 'Felicidad',
    item: 'Objeto',
    values: 'Valores',
  },
  en: {
    pageTitle: 'Page',
    of: 'of',
    all: 'All types',
    search: 'Search by name (e.g. pikachu)',
    searchBtn: 'Search',
    filterBtn: 'Filter by type',
    activeFilter: 'Active filter',
    clearFilter: '(clear)',
    prev: 'Previous',
    next: 'Next',
    notFound: 'Pokemon not found. Try the exact English name.',
    noResults: 'No results',
    height: 'Height',
    weight: 'Weight',
    m: 'm',
    kg: 'kg',
    types: 'Types',
    abilities: 'Abilities',
    baseStats: 'Base Stats',
    moves: 'Moves (some)',
    back: '← Back',
    loading: 'Loading...',
    error: 'Error loading pokemons',
    errorDetail: 'Error loading detail',
    errorLoading: 'Error loading information',
    type: 'Type',
    power: 'Power',
    accuracy: 'Accuracy',
    pp: 'PP',
    pokemonInfo: 'Pokemon Information',
    webCreatedBy: 'Web created by Joaquin L. Villanueva Farber',
    apiUsed: 'API used',
    weakness: 'Weakness',
    resistance: 'Resistance',
    immune: 'Immune',
    evolution: 'Evolution',
    shiny: 'Shiny',
    normal: 'Normal',
    playCry: 'Play cry',
    advancedSearch: 'Advanced search',
    filterByTypes: 'Filter by types (multi-select)',
    filterByPhase: 'Filter by phase',
    filterByRegion: 'Filter by region',
    filterByGeneration: 'Filter by generation',
    allPhases: 'All',
    phaseBaby: 'Baby',
    phaseBase: 'Base',
    phaseStage1: 'Stage 1',
    phaseStage2: 'Stage 2 (final evolution)',
    allRegions: 'All',
    allGenerations: 'All',
    applyFilters: 'Apply filters',
    clearFilters: 'Clear',
    legendary: 'Legendary',
    mythical: 'Mythical',
    baby: 'Baby',
    levelUp: 'Level up',
    useItem: 'Use item',
    trade: 'Trade',
    happiness: 'Happiness',
    item: 'Item',
    values: 'Values',
  }
};

function t(key){
  return translations[appLang][key] || translations['es'][key] || key;
}

function getStatTranslation(statName){
  return statTranslations[statName]?.[appLang] || statName;
}

function qs(name, defaultVal) {
  const params = new URLSearchParams(location.search);
  return params.get(name) ?? defaultVal;
}

async function fetchJson(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Network error');
  return res.json();
}

// INDEX PAGE
let currentDetails = [];
let moveCache = {};
let abilityCache = {};
let _moveTooltip = null;
let typeNameCache = {};
let weaknessCache = {};
let evolutionCache = {};
let speciesStageCache = {}; // species name -> 'baby'|'base'|'stage1'|'stage2'

const generationNames = { 'generation-i': '1', 'generation-ii': '2', 'generation-iii': '3', 'generation-iv': '4', 'generation-v': '5', 'generation-vi': '6', 'generation-vii': '7', 'generation-viii': '8', 'generation-ix': '9' };
const regionNames = { kanto: 'Kanto', 'original-johto': 'Johto', johto: 'Johto', hoenn: 'Hoenn', sinnoh: 'Sinnoh', 'original-sinnoh': 'Sinnoh', 'extended-sinnoh': 'Sinnoh', unova: 'Unova', 'original-unova': 'Unova', 'updated-unova': 'Unova', kalos: 'Kalos', 'kalos-central': 'Kalos', 'kalos-coastal': 'Kalos', 'kalos-mountain': 'Kalos', alola: 'Alola', 'original-alola': 'Alola', 'updated-alola': 'Alola', galar: 'Galar', hisui: 'Hisui', paldea: 'Paldea', kitakami: 'Kitakami', national: 'Nacional' };

// Returns display name in current app language with capitalized first letter
async function fetchTypeDisplayName(typeKey){
  const cacheKey = `${typeKey}_${appLang}`;
  if(typeNameCache[cacheKey] !== undefined) return typeNameCache[cacheKey];
  try{
    let display = typeTranslations[typeKey]?.[appLang] || typeKey;
    display = display.charAt(0).toUpperCase() + display.slice(1);
    typeNameCache[cacheKey] = display;
    return display;
  }catch(e){
    typeNameCache[cacheKey] = typeKey;
    return typeKey;
  }
}

// Get weaknesses for a pokemon based on its types
async function getPokemonWeaknesses(pokemonTypes) {
  const multipliers = {};

  for (const t of pokemonTypes) {
    const typeData = await fetchJson(`${API_BASE}/type/${t.type.name}`);
    const dmg = typeData.damage_relations;

    dmg.double_damage_from.forEach(d => {
      multipliers[d.name] = (multipliers[d.name] ?? 1) * 2;
    });

    dmg.half_damage_from.forEach(d => {
      multipliers[d.name] = (multipliers[d.name] ?? 1) * 0.5;
    });

    dmg.no_damage_from.forEach(d => {
      multipliers[d.name] = 0;
    });
  }

  return Object.entries(multipliers)
    .filter(([, m]) => m > 1)
    .map(([type, multiplier]) => ({
      type,
      multiplier
    }));
}

// Get resistances (and immunities) for a pokemon based on its types
async function getPokemonResistances(pokemonTypes) {
  const multipliers = {};

  for (const t of pokemonTypes) {
    const typeData = await fetchJson(`${API_BASE}/type/${t.type.name}`);
    const dmg = typeData.damage_relations;

    dmg.half_damage_from.forEach(d => {
      multipliers[d.name] = (multipliers[d.name] ?? 1) * 0.5;
    });

    dmg.no_damage_from.forEach(d => {
      multipliers[d.name] = 0;
    });
  }

  return Object.entries(multipliers)
    .filter(([, m]) => m < 1)
    .map(([type, multiplier]) => ({
      type,
      multiplier
    }));
}

// Returns evolution chain with full details (trigger, item, min_level, min_happiness) for display
async function getEvolutionChainWithDetails(pokemonId) {
  const pokemon = await fetchJson(`${API_BASE}/pokemon/${pokemonId}`);
  const species = await fetchJson(pokemon.species.url);
  const chainData = await fetchJson(species.evolution_chain.url);
  const chain = [];

  function traverse(node, detailsFromParent = null) {
    const d = node.evolution_details?.[0];
    const evo = {
      name: node.species.name,
      minLevel: d?.min_level ?? null,
      item: d?.item?.name ?? null,
      trigger: d?.trigger?.name ?? null,
      minHappiness: d?.min_happiness ?? null,
      minAffection: d?.min_affection ?? null,
      tradeSpecies: d?.trade_species?.name ?? null,
    };
    chain.push(evo);
    if (node.evolves_to.length > 0) {
      traverse(node.evolves_to[0]);
    }
  }

  traverse(chainData.chain);
  return chain;
}

// Same chain structure as before for backward compat (name, minLevel)
async function getEvolutionChain(pokemonId) {
  const full = await getEvolutionChainWithDetails(pokemonId);
  return full.map(e => ({ name: e.name, minLevel: e.minLevel }));
}

// Get evolution stage for a species: 'baby' | 'base' | 'stage1' | 'stage2'
async function getSpeciesEvolutionStage(speciesName) {
  if (speciesStageCache[speciesName]) return speciesStageCache[speciesName];
  try {
    const species = await fetchJson(`${API_BASE}/pokemon-species/${speciesName}`);
    if (species.is_baby) {
      speciesStageCache[speciesName] = 'baby';
      return 'baby';
    }
    const chainData = await fetchJson(species.evolution_chain.url);
    function depth(node, d) {
      if (node.species.name === speciesName) return d;
      for (const child of node.evolves_to || []) {
        const r = depth(child, d + 1);
        if (r !== -1) return r;
      }
      return -1;
    }
    const myDepth = depth(chainData.chain, 0);
    if (myDepth === -1) {
      speciesStageCache[speciesName] = 'base';
      return 'base';
    }
    function maxDepth(node, d) {
      let max = d;
      for (const child of node.evolves_to || []) max = Math.max(max, maxDepth(child, d + 1));
      return max;
    }
    const maxD = maxDepth(chainData.chain, 0);
    if (myDepth === 0) {
      speciesStageCache[speciesName] = 'base';
      return 'base';
    }
    if (myDepth === maxD) {
      speciesStageCache[speciesName] = 'stage2';
      return 'stage2';
    }
    speciesStageCache[speciesName] = 'stage1';
    return 'stage1';
  } catch (e) {
    speciesStageCache[speciesName] = 'base';
    return 'base';
  }
}

function showMoveTooltip(html, x, y){
  if(!_moveTooltip){
    _moveTooltip = document.createElement('div');
    _moveTooltip.className = 'move-tooltip';
    document.body.appendChild(_moveTooltip);
  }
  _moveTooltip.innerHTML = html;
  _moveTooltip.style.display = 'block';
  const pad = 12;
  requestAnimationFrame(()=>{
    const w = _moveTooltip.offsetWidth;
    const h = _moveTooltip.offsetHeight;
    let left = x + pad;
    let top = y + pad;
    if(left + w + 8 > window.innerWidth) left = x - w - pad;
    if(top + h + 8 > window.innerHeight) top = y - h - pad;
    _moveTooltip.style.left = `${Math.max(8, left)}px`;
    _moveTooltip.style.top = `${Math.max(8, top)}px`;
  });
}

function hideMoveTooltip(){
  if(_moveTooltip) _moveTooltip.style.display = 'none';
}

function getFiltersFromUrl() {
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

function buildQueryFromFilters(filters) {
  const p = new URLSearchParams();
  if (filters.page) p.set('page', String(filters.page));
  if (filters.types?.length) p.set('types', filters.types.join(','));
  if (filters.phase && filters.phase !== 'all') p.set('phase', filters.phase);
  if (filters.region && filters.region !== 'all') p.set('region', filters.region);
  if (filters.generation && filters.generation !== 'all') p.set('generation', filters.generation);
  const q = p.toString();
  return q ? '?' + q : '?page=1';
}

async function renderCards(list){
  const wrap = document.getElementById('pokemon-list');
  const filters = getFiltersFromUrl();
  const returnQuery = buildQueryFromFilters(filters, filters.page);
  wrap.innerHTML = '';
  for(const pokemon of list){
    if(!pokemon) continue;
    const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
    const typesArr = await Promise.all(pokemon.types.map(async t=>{
      const disp = await fetchTypeDisplayName(t.type.name);
      return `<span class="type" data-type="${t.type.name}">${disp}</span>`;
    }));
    const typesHtml = typesArr.join(' ');
    
    const card = document.createElement('article');
    card.className = 'card';
    card.addEventListener('click', ()=> {
      location.href = `detail.html?name=${pokemon.name}${returnQuery ? '&' + returnQuery.slice(1) : ''}`;
    });
    const img = document.createElement('div'); 
    img.className='sprite';
    img.innerHTML = spriteUrl? `<img src="${spriteUrl}" alt="${pokemon.name}" loading="lazy" style="max-width:100%;height:auto;">` : '';
    const title = document.createElement('div'); 
    title.className='pokemon-name'; 
    title.textContent = `#${pokemon.id}`;
    const name = document.createElement('div');
    name.style.fontSize = '0.9rem';
    name.style.fontWeight = '600';
    name.style.color = '#111';
    name.style.textTransform = 'capitalize';
    name.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const meta = document.createElement('div'); 
    meta.className='meta';
    meta.innerHTML = typesHtml;
    card.appendChild(img); 
    card.appendChild(title); 
    card.appendChild(name);
    card.appendChild(meta);
    wrap.appendChild(card);
  }
}

// Build array of page numbers to show (Google-style: 3 before, current, 3 after + first/last)
function getPageNumbersToShow(currentPage, totalPages) {
  if (totalPages <= 0) return [];
  if (totalPages <= 9) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const delta = 3; // pages before/after current
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

async function loadList(filtersArg){
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
    let allPokemonRefs = []; // { name } or list of urls to fetch

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

    // If types filter: keep only pokemon that have ALL selected types (exclusive / AND)
    let listToFilter = allPokemonRefs;
    if (types.length > 0 && allPokemonRefs.length > 0) {
      const typeSets = await Promise.all(types.map(t => fetchJson(`${API_BASE}/type/${t}`).then(d => new Set((d.pokemon || []).map(p => p.pokemon.name)))));
      const hasAllTypes = (name) => typeSets.every(set => set.has(name));
      const getName = (ref) => ref.name || (ref.url && ref.url.split('/').filter(Boolean).pop());
      listToFilter = allPokemonRefs.filter(ref => hasAllTypes(getName(ref)));
    }

    // Phase filter: need species name and evolution stage
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

    pageInfo.textContent = `${t('pageTitle')} ${page} — ${offset + 1}–${Math.min(offset + LIMIT, total)} ${t('of')} ${total}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = offset + LIMIT >= total;

    await renderCards(currentDetails.filter(Boolean));
    updateActiveFilterLabel(filters);

    const basePageParam = (n) => buildQueryFromFilters({ ...filters, page: String(n) });
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));
    renderPageNumbers(page, totalPages, basePageParam);

    prevBtn.onclick = () => {
      if (page > 1) {
        history.pushState({}, '', basePageParam(page - 1));
        loadList({ ...filters, page: String(page - 1) });
      }
    };
    nextBtn.onclick = () => {
      history.pushState({}, '', basePageParam(page + 1));
      loadList({ ...filters, page: String(page + 1) });
    };
  } catch (e) {
    const wrap = document.getElementById('pokemon-list');
    wrap.innerHTML = `<p>${t('error')}: ${e.message}</p>`;
  }
}

// DETAIL PAGE
async function loadDetail(){
  const name = qs('name', null);
  const container = document.getElementById('detail');
  const title = document.getElementById('pokemon-name');
  if(!name){ container.innerHTML = '<p>Falta nombre o id en la URL.</p>'; return; }
  try{
    const p = await fetchJson(`${API_BASE}/pokemon/${name}`);
    const capitalizedName = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    title.textContent = `#${p.id} ${capitalizedName}`;
    const sprite = p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '';
    const spriteShiny = p.sprites?.other?.['official-artwork']?.front_shiny || p.sprites?.front_shiny || '';
    const types = (await Promise.all(p.types.map(async t=> await fetchTypeDisplayName(t.type.name)))).join(', ');
    const abilitiesHtml = p.abilities.map(a =>
      `<span class="badge bg-secondary me-2 mb-2 ability-badge" data-url="${a.ability.url}">${a.ability.name.replace(/-/g, ' ')}${a.is_hidden ? ' <span class="ability-hidden">(Hidden)</span>' : ''}</span>`
    ).join('');
    const statsHtml = p.stats.map(s=>`<div class="stat"><strong>${s.stat.name}</strong><div>${s.base_stat}</div></div>`).join('');
    
    // Get weaknesses
    const weaknesses = await getPokemonWeaknesses(p.types);
    const weaknessHtml = weaknesses.length > 0 ? `
      <div class="mb-3">
        <strong>${t('weakness')}:</strong>
        <div class="mt-2">
          ${(
            await Promise.all(
              weaknesses.map(async w => `
                <span class="badge"
                      style="background:var(--${w.type})">
                  ${await fetchTypeDisplayName(w.type)}
                  x${w.multiplier}
                </span>
              `)
            )
          ).join(' ')}
        </div>
      </div>
    ` : '';

    // Get resistances (half damage + immunities)
    const resistances = await getPokemonResistances(p.types);
    const resistanceHtml = resistances.length > 0 ? `
      <div class="mb-3">
        <strong>${t('resistance')}:</strong>
        <div class="mt-2">
          ${(
            await Promise.all(
              resistances.map(async r => `
                <span class="badge"
                      style="background:var(--${r.type})">
                  ${await fetchTypeDisplayName(r.type)}
                  ${r.multiplier === 0 ? t('immune') : `x${r.multiplier}`}
                </span>
              `)
            )
          ).join(' ')}
        </div>
      </div>
    ` : '';
    
    const params = new URLSearchParams(location.search);
    params.delete('name');
    const returnQuery = params.toString() ? '&' + params.toString() : '';
    // Species tags (legendary, mythical, baby) — Legendario/Mítico con fuente Bungee y fondo arcoíris
    const species = await fetchJson(p.species.url);
    const tagParts = [];
    if (species.is_legendary) tagParts.push(`<span class="detail-tag detail-tag-legendary">${t('legendary')}</span>`);
    if (species.is_mythical) tagParts.push(`<span class="detail-tag detail-tag-mythical">${t('mythical')}</span>`);
    if (species.is_baby) tagParts.push(`<span class="detail-tag detail-tag-baby">${t('baby')}</span>`);
    const tagsHtml = tagParts.length > 0 ? `<div class="mb-2 detail-tags">${tagParts.join(' ')}</div>` : '';
    // Evolution chain with full details (how to evolve)
    const evolutionChainWithDetails = await getEvolutionChainWithDetails(p.id);
    let evolutionHtml = '';
    if (evolutionChainWithDetails.length > 1) {
      const evoCards = await Promise.all(
        evolutionChainWithDetails.map(async (evo, index) => {
          const evoData = await fetchJson(`${API_BASE}/pokemon/${evo.name}`);
          const sprite = evoData.sprites.front_default;
          const displayName = evo.name.charAt(0).toUpperCase() + evo.name.slice(1);
          let methodText = '';
          if (index === 0) {
            methodText = appLang === 'es' ? 'Forma base' : 'Base form';
          } else {
            const e = evo;
            const parts = [];
            if (e.trigger === 'level-up' && (e.minLevel || e.minHappiness)) {
              if (e.minLevel) parts.push(`${appLang === 'es' ? 'Nivel' : 'Level'} ${e.minLevel}`);
              if (e.minHappiness) parts.push(`${t('happiness')} ${e.minHappiness}`);
            } else if (e.trigger === 'level-up') {
              parts.push(t('levelUp'));
            }
            if (e.item) parts.push((e.item.replace(/-/g, ' ')).replace(/\b\w/g, c => c.toUpperCase()));
            if (e.trigger === 'trade') parts.push(t('trade'));
            if (e.minAffection) parts.push(`${appLang === 'es' ? 'Cariño' : 'Affection'} ${e.minAffection}`);
            methodText = parts.length ? parts.join(' · ') : (index === evolutionChainWithDetails.length - 1 ? (appLang === 'es' ? 'Evolución final' : 'Final evolution') : '—');
          }
          return `
            <div class="text-center evo-step">
              <div class="evo-card"
                  style="cursor:pointer"
                  onclick="location.href='detail.html?name=${evo.name}${returnQuery}'">
                <img src="${sprite}" alt="${displayName}">
                <div class="evo-name">${displayName}</div>
              </div>
              ${index > 0 ? `<div class="evo-level-label">${appLang === 'es' ? 'Requisito:' : 'Requirement:'}</div>` : ''}
              <div class="evo-level">${methodText}</div>
            </div>
            ${index < evolutionChainWithDetails.length - 1 ? `<div class="evo-arrow">→</div>` : ''}
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
    const shinyIconHtml = `<img src="shiny-stars.png" class="detail-shiny-icon" alt="">`;
    const cryIconSvg = `<svg class="detail-cry-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15 10a3 3 0 0 1 0 4M18 9a4 4 0 0 1 0 6"/></svg>`;
    const typesBadgesHtml = (await Promise.all(p.types.map(async t=> `<span class="badge" style="background:var(--${t.type.name})">${await fetchTypeDisplayName(t.type.name)}</span>`))).join(' ');
    const statsBlocksHtml = p.stats.map(s=>`
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <strong>${getStatTranslation(s.stat.name)}</strong>
          <span>${s.base_stat}</span>
        </div>
        <div class="progress">
          <div class="progress-bar" style="width:${(s.base_stat/150)*100}%"></div>
        </div>
      </div>
    `).join('');
    const movesBadgesHtml = p.moves.slice(0,12).map(m=>`<span class="badge bg-secondary me-2 mb-2 move-badge" data-url="${m.move.url}">${m.move.name}</span>`).join('');

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
    // attach hover handlers for move and ability tooltips
    try{ attachMoveHover(container); }catch(e){/* no-op */}
    try{ attachAbilityHover(container); }catch(e){/* no-op */}
  }catch(e){ container.innerHTML = `<p>${t('errorDetail')}: ${e.message}</p>` }
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Detect browser language once at the beginning
  const browserLang = navigator.language || navigator.userLanguage || 'es';
  appLang = browserLang.startsWith('en') ? 'en' : 'es';
  
  // Update footer text
  const footerEl = document.getElementById('footer-text');
  if(footerEl) footerEl.textContent = t('webCreatedBy');
  const footerApi = document.getElementById('footer-api');
  if(footerApi) footerApi.innerHTML = `${t('apiUsed')} <a href="https://pokeapi.co/" target="_blank" rel="noopener noreferrer" class="text-white-50 text-decoration-none">https://pokeapi.co/</a>`;

  // Update button texts
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.querySelector('#searchForm button');
  const advancedBtn = document.getElementById('advancedSearchBtn');
  
  if(prevBtn) prevBtn.textContent = t('prev');
  if(nextBtn) nextBtn.textContent = t('next');
  if(searchInput) searchInput.placeholder = t('search');
  if(searchBtn) searchBtn.textContent = t('searchBtn');
  if(advancedBtn) advancedBtn.textContent = t('advancedSearch');

  if(document.getElementById('pokemon-list')){
    initSearchAndFilters();
    loadTypes();
    loadGenerations();
    loadRegions();
    syncFiltersToUrl(getFiltersFromUrl());
    loadList();
  }
  if(document.getElementById('detail')){
    loadDetail();
    const backLink = document.getElementById('backLink');
    if(backLink){
      const params = new URLSearchParams(location.search);
      params.delete('name');
      backLink.href = 'index.html?' + params.toString();
    }
  }
  window.addEventListener('popstate', ()=>{
    syncFiltersToUrl(getFiltersFromUrl());
    updateActiveFilterLabel(getFiltersFromUrl());
    loadList();
  });
});

function initSearchAndFilters(){
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const suggestionsDiv = document.getElementById('searchSuggestions');
  let suggestionTimeout;

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const q = input.value.trim().toLowerCase();
    if(!q) return;
    try{
      await fetchJson(`${API_BASE}/pokemon/${q}`);
      const filters = getFiltersFromUrl();
      const query = buildQueryFromFilters(filters);
      location.href = `detail.html?name=${q}${query !== '?page=1' ? '&' + query.slice(1) : '&page=1'}`;
    }catch(_){
      showErrorToast(t('notFound'));
    }
  });

  let currentSuggestionIndex = -1;
  let totalSuggestions = 0;

  input?.addEventListener('input', async (e)=>{
    clearTimeout(suggestionTimeout);
    const q = e.target.value.trim().toLowerCase();
    currentSuggestionIndex = -1;
    
    if(!q){
      suggestionsDiv.innerHTML = '';
      return;
    }

    suggestionTimeout = setTimeout(async ()=>{
      try{
        const data = await fetchJson(`${API_BASE}/pokemon?limit=1000`);
        const matches = data.results.filter(p => p.name.includes(q)).slice(0, 8);
        totalSuggestions = matches.length;
        
        if(matches.length === 0){
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
      }catch(e){
        suggestionsDiv.innerHTML = `<div class="suggestion-item no-results">${t('errorLoading')}</div>`;
      }
    }, 300);
  });

  function highlightSuggestion(index) {
    const items = suggestionsDiv.querySelectorAll('.suggestion-item:not(.no-results)');
    items.forEach((item, idx) => item.classList.toggle('highlighted', idx === index));
    if (index >= 0 && items[index]) items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  input?.addEventListener('keydown', (e)=>{
    const items = suggestionsDiv.querySelectorAll('.suggestion-item:not(.no-results)');
    if(items.length === 0) return;
    
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, items.length - 1);
      highlightSuggestion(currentSuggestionIndex);
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
      highlightSuggestion(currentSuggestionIndex);
    } else if(e.key === 'Enter'){
      e.preventDefault();
      const idx = currentSuggestionIndex >= 0 ? currentSuggestionIndex : 0;
      items[idx].click();
    }
  });

  input?.addEventListener('blur', ()=>{
    setTimeout(()=> suggestionsDiv.innerHTML = '', 200);
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

function showErrorToast(message){
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(()=> toast.classList.add('show'), 10);
  setTimeout(()=> {
    toast.classList.remove('show');
    setTimeout(()=> toast.remove(), 300);
  }, 4000);
}

function getFiltersFromDom() {
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

function syncFiltersToUrl(filters) {
  document.querySelectorAll('#filterTypesCheckboxes input[name="filterType"]').forEach(cb => { cb.checked = (filters.types || []).includes(cb.value); });
  const phaseSel = document.getElementById('filterPhaseSelect');
  const regionSel = document.getElementById('filterRegionSelect');
  const genSel = document.getElementById('filterGenerationSelect');
  if (phaseSel) phaseSel.value = filters.phase || 'all';
  if (regionSel) regionSel.value = filters.region || 'all';
  if (genSel) genSel.value = filters.generation || 'all';
}

async function loadTypes(){
  try{
    const data = await fetchJson(`${API_BASE}/type`);
    const wrap = document.getElementById('filterTypesCheckboxes');
    if(!wrap) return;
    wrap.innerHTML = '';
    data.results.forEach(ty=>{
      const label = document.createElement('label');
      label.className = 'd-inline-block me-3 mb-1';
      const translated = typeTranslations[ty.name]?.[appLang] || ty.name;
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
  }catch(e){ console.warn('No se pudieron cargar tipos', e); }
}

async function loadGenerations() {
  try {
    const data = await fetchJson(`${API_BASE}/generation`);
    const select = document.getElementById('filterGenerationSelect');
    if (!select) return;
    data.results.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.name;
      const num = generationNames[g.name] || g.name;
      opt.textContent = appLang === 'es' ? `Generación ${num}` : `Generation ${num}`;
      select.appendChild(opt);
    });
  } catch (e) { console.warn('No se pudieron cargar generaciones', e); }
}

async function loadRegions() {
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
  } catch (e) { console.warn('No se pudieron cargar regiones', e); }
}

function updateActiveFilterLabel(filters){
  const el = document.getElementById('activeFilter');
  if(!el) return;
  const parts = [];
  if (filters.types?.length) parts.push(t('filterByTypes') + ': ' + filters.types.map(ty => (typeTranslations[ty]?.[appLang] || ty)).join(', '));
  if (filters.phase && filters.phase !== 'all') parts.push(t('filterByPhase') + ': ' + (filters.phase === 'baby' ? t('phaseBaby') : filters.phase === 'base' ? t('phaseBase') : filters.phase === 'stage1' ? t('phaseStage1') : t('phaseStage2')));
  if (filters.region && filters.region !== 'all') parts.push(t('filterByRegion') + ': ' + (regionNames[filters.region] || filters.region));
  if (filters.generation && filters.generation !== 'all') parts.push(t('filterByGeneration') + ': ' + (generationNames[filters.generation] || filters.generation));
  if (parts.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `<div class="badge bg-info text-dark">${t('activeFilter')}: ${parts.join(' · ')}</div> <button id="clearFilter" class="btn btn-sm btn-link">${t('clearFilter')}</button>`;
  const btn = document.getElementById('clearFilter');
  btn?.addEventListener('click', (e)=>{ e.preventDefault(); history.pushState({},'', '?page=1'); syncFiltersToUrl({ types: [], phase: 'all', region: 'all', generation: 'all', page: '1' }); loadList({ types: [], phase: 'all', region: 'all', generation: 'all', page: '1' }); });
}

async function attachMoveHover(container){
  const badges = container.querySelectorAll('.move-badge');
  badges.forEach(b => {
    const url = b.dataset.url;
    let mouseMoveHandler = (e) => showMoveTooltip(b.dataset.tip || 'Cargando...', e.clientX, e.clientY);
    b.addEventListener('mouseenter', async (ev)=>{
      document.addEventListener('mousemove', mouseMoveHandler);
      if(moveCache[url]){
        b.dataset.tip = await formatMoveHtmlAsync(moveCache[url]);
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
        return;
      }
      try{
        const m = await fetchJson(url);
        moveCache[url] = m;
        b.dataset.tip = await formatMoveHtmlAsync(m);
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
      }catch(_){
        b.dataset.tip = 'No se pudo cargar información';
        showMoveTooltip(b.dataset.tip, ev.clientX, ev.clientY);
      }
    });
    b.addEventListener('mouseleave', ()=>{
      document.removeEventListener('mousemove', mouseMoveHandler);
      hideMoveTooltip();
    });
  });
}

async function formatMoveHtmlAsync(m){
  let moveName, effect;
  
  if(appLang === 'es'){
    moveName = (m.names||[]).find(n=>n.language?.name==='es')?.name || m.name;
    effect = (m.effect_entries||[]).find(e=>e.language?.name==='es')?.short_effect || (m.flavor_text_entries||[]).find(e=>e.language?.name==='es')?.flavor_text || '';
  } else {
    moveName = (m.names||[]).find(n=>n.language?.name==='en')?.name || m.name;
    effect = (m.effect_entries||[]).find(e=>e.language?.name==='en')?.short_effect || (m.flavor_text_entries||[]).find(e=>e.language?.name==='en')?.flavor_text || '';
  }
  
  const typeKey = m.type?.name || (m.type && m.type.name) || null;
  const typeDisplay = typeKey ? await fetchTypeDisplayName(typeKey) : (m.type?.name || '-');
  return `
    <div style="font-weight:600;text-transform:capitalize">${moveName}</div>
    <div class="muted">Tipo: ${typeDisplay} — PP: ${m.pp ?? '-'} — Potencia: ${m.power ?? '-'} — Precisión: ${m.accuracy ?? '-'}</div>
    <div style="margin-top:6px">${effect}</div>
  `;
}

// Extrae números, multiplicadores y porcentajes del texto de efecto para mostrarlos destacados
function extractAbilityNumbers(effectText) {
  if (!effectText || typeof effectText !== 'string') return [];
  const values = [];
  const seen = new Set();
  // Multiplicadores: 1.5×, 2×, 0.5× o 1.5x, 2x
  (effectText.match(/\d+\.?\d*[×x]/gi) || []).forEach(m => { const n = m.replace(/x$/i, '×'); if (!seen.has(n)) { seen.add(n); values.push(n); } });
  // Porcentajes: 50%, 30%
  (effectText.match(/\d+%/g) || []).forEach(m => { if (!seen.has(m)) { seen.add(m); values.push(m); } });
  // Fracciones: 1/3, 1/2
  (effectText.match(/\d+\/\d+/g) || []).forEach(m => { if (!seen.has(m)) { seen.add(m); values.push(m); } });
  // Números enteros relevantes (ej. "by 1 stage", "for 5 turns") — solo si no hay otros valores
  if (values.length === 0) {
    (effectText.match(/\b(\d+)\s*(stage|turn|level|point|stat)\w*/gi) || []).forEach(_ => {});
    const stageTurn = effectText.match(/(\d+)\s*(stage|turn|level)/gi);
    if (stageTurn) stageTurn.forEach(s => { const m = s.match(/\d+/); if (m && !seen.has(m[0])) { seen.add(m[0]); values.push(m[0]); } });
  }
  return values;
}

async function formatAbilityHtmlAsync(a){
  let name, effect;
  if (appLang === 'es') {
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
  `;
}

async function attachAbilityHover(container){
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
