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
    weakness: 'Debilidad',
    evolution: 'Evolución',
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
    weakness: 'Weakness',
    evolution: 'Evolution',
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
let _moveTooltip = null;
let typeNameCache = {};
let weaknessCache = {};
let evolutionCache = {};

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

async function getEvolutionChain(pokemonId) {
  const pokemon = await fetchJson(`${API_BASE}/pokemon/${pokemonId}`);
  const species = await fetchJson(pokemon.species.url);
  const chainData = await fetchJson(species.evolution_chain.url);

  const chain = [];

  function traverse(node) {
    const evo = {
      name: node.species.name,
      minLevel: node.evolution_details[0]?.min_level ?? null
    };
    chain.push(evo);

    if (node.evolves_to.length > 0) {
      traverse(node.evolves_to[0]);
    }
  }

  traverse(chainData.chain);
  return chain;
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

async function renderCards(list){
  const wrap = document.getElementById('pokemon-list');
  const typeFilter = document.getElementById('typeSelect')?.value || 'all';
  wrap.innerHTML = '';
  for(const pokemon of list){
    if(!pokemon) continue;
    if(typeFilter !== 'all' && !pokemon.types.some(t=>t.type.name === typeFilter)) continue;
    const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
    const typesArr = await Promise.all(pokemon.types.map(async t=>{
      const disp = await fetchTypeDisplayName(t.type.name);
      return `<span class="type" data-type="${t.type.name}">${disp}</span>`;
    }));
    const typesHtml = typesArr.join(' ');
    
    const card = document.createElement('article');
    card.className = 'card';
    card.addEventListener('click', ()=> location.href = `detail.html?name=${pokemon.name}`);
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
      loadList(num, qs('type', 'all'));
    };
    container.appendChild(btn);
    prevNum = num;
  }
}

async function loadList(pageArg, typeArg){
  const page = Number(pageArg ?? qs('page', '1'));
  const type = typeArg ?? qs('type', 'all');
  const offset = (page-1)*LIMIT;
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  try{
    let total = 0;
    if(type === 'all'){
      const listUrl = `${API_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`;
      const data = await fetchJson(listUrl);
      total = data.count;
      pageInfo.textContent = `${t('pageTitle')} ${page} — ${offset+1}–${Math.min(offset+LIMIT, total)} ${t('of')} ${total}`;
      prevBtn.disabled = !data.previous;
      nextBtn.disabled = !data.next;

      currentDetails = await Promise.all(data.results.map(r=>fetchJson(r.url).catch(()=>null)));
    } else {
      // Fetch pokemons for the selected type and paginate the results client-side
      const typeData = await fetchJson(`${API_BASE}/type/${type}`);
      const allOfType = (typeData.pokemon || []).map(p => p.pokemon);
      total = allOfType.length;
      pageInfo.textContent = `${t('pageTitle')} ${page} — ${offset+1}–${Math.min(offset+LIMIT, total)} ${t('of')} ${total}`;
      prevBtn.disabled = page <= 1;
      nextBtn.disabled = offset + LIMIT >= total;

      const slice = allOfType.slice(offset, offset + LIMIT);
      currentDetails = await Promise.all(slice.map(p => fetchJson(p.url).catch(()=>null)));
    }

    await renderCards(currentDetails.filter(Boolean));
    updateActiveFilterLabel(type);

    const basePageParam = (n) => `?page=${n}${type && type !== 'all' ? `&type=${encodeURIComponent(type)}` : ''}`;
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));
    renderPageNumbers(page, totalPages, basePageParam);

    prevBtn.onclick = ()=> { if(page>1){ const n = page-1; history.pushState({},'', basePageParam(n)); loadList(n, type); } };
    nextBtn.onclick = ()=> { const n = page+1; history.pushState({},'', basePageParam(n)); loadList(n, type); };
  }catch(e){
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
    const types = (await Promise.all(p.types.map(async t=> await fetchTypeDisplayName(t.type.name)))).join(', ');
    const abilities = p.abilities.map(a=>a.ability.name).join(', ');
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
    
    // Get evolutions
    const evolutionChain = await getEvolutionChain(p.id);
    let evolutionHtml = '';
    if (evolutionChain.length > 1) {
      const evoCards = await Promise.all(
        evolutionChain.map(async (evo, index) => {
          const evoData = await fetchJson(`${API_BASE}/pokemon/${evo.name}`);
          const sprite = evoData.sprites.front_default;
          const displayName = evo.name.charAt(0).toUpperCase() + evo.name.slice(1);

          return `
            <div class="text-center">
              <div class="evo-card"
                  style="cursor:pointer"
                  onclick="location.href='detail.html?name=${evo.name}'">
                <img src="${sprite}" alt="${displayName}">
                <div class="evo-name">${displayName}</div>
              </div>
              <div class="evo-level">
                ${
                  index === evolutionChain.length - 1
                    ? 'Max'
                    : evo.minLevel
                      ? `Level ${evo.minLevel}`
                      : 'Base'
                }
              </div>
            </div>
            ${index < evolutionChain.length - 1 ? `<div class="evo-arrow">→</div>` : ''}
          `;
        })
      );

      evolutionHtml = `
        <div class="mb-4">
          <strong>${t('evolution')}:</strong>
          <div class="d-flex align-items-center gap-3 mt-3 flex-wrap">
            ${evoCards.join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="row">
        <div class="col-md-4 text-center">
          <div style="min-height:300px;display:flex;align-items:center;justify-content:center;">
            ${sprite? `<img src="${sprite}" alt="${p.name}" style="max-width:100%;height:auto;">` : ''}
          </div>
        </div>
        <div class="col-md-8">
          <h2 class="mb-3">${t('pokemonInfo')}</h2>
          <div class="mb-3">
            <strong>${t('types')}:</strong>
              <div class="mt-2">${(await Promise.all(p.types.map(async t=> `<span class="badge" style="background:var(--${t.type.name})">${await fetchTypeDisplayName(t.type.name)}</span>`)) ).join(' ')}</div>
          </div>
          ${weaknessHtml}
          <p><strong>${t('height')}:</strong> ${p.height / 10} ${t('m')}</p>
          <p><strong>${t('weight')}:</strong> ${p.weight / 10} ${t('kg')}</p>
          <p><strong>${t('abilities')}:</strong> ${abilities}</p>
          ${evolutionHtml}
          <h4 class="mt-4">${t('baseStats')}</h4>
          <div class="row">
            ${p.stats.map(s=>`
              <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <strong>${getStatTranslation(s.stat.name)}</strong>
                  <span>${s.base_stat}</span>
                </div>
                <div class="progress">
                  <div class="progress-bar" style="width:${(s.base_stat/150)*100}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      <section class="mt-5">
        <h3 class="mb-3">${t('moves')}</h3>
        <div>${p.moves.slice(0,12).map(m=>`<span class="badge bg-secondary me-2 mb-2 move-badge" data-url="${m.move.url}">${m.move.name}</span>`).join('')}</div>
      </section>
    `;
    // attach hover handlers for move tooltips
    try{ attachMoveHover(container); }catch(e){/* no-op */}
  }catch(e){ container.innerHTML = `<p>${t('errorDetail')}: ${e.message}</p>` }
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Detect browser language once at the beginning
  const browserLang = navigator.language || navigator.userLanguage || 'es';
  appLang = browserLang.startsWith('en') ? 'en' : 'es';
  
  // Update footer text
  const footerEl = document.getElementById('footer-text');
  if(footerEl){
    footerEl.textContent = t('webCreatedBy');
  }

  // Update button texts
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.querySelector('#searchForm button');
  const typeSelect = document.getElementById('typeSelect');
  
  if(prevBtn) prevBtn.textContent = t('prev');
  if(nextBtn) nextBtn.textContent = t('next');
  if(searchInput) searchInput.placeholder = t('search');
  if(searchBtn) searchBtn.textContent = t('searchBtn');
  if(typeSelect) {
    const firstOpt = typeSelect.options[0];
    if(firstOpt) firstOpt.textContent = t('all');
  }

  if(document.getElementById('pokemon-list')){
    loadList();
    initSearchAndFilters();
    loadTypes();
  }
  if(document.getElementById('detail')) loadDetail();
  window.addEventListener('popstate', ()=>{
    const current = qs('type','all');
    const select = document.getElementById('typeSelect'); if(select) select.value = current;
    updateActiveFilterLabel(current);
    loadList();
  });
});

function initSearchAndFilters(){
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const select = document.getElementById('typeSelect');
  const suggestionsDiv = document.getElementById('searchSuggestions');
  let suggestionTimeout;

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const q = input.value.trim().toLowerCase();
    if(!q) return;
    try{
      await fetchJson(`${API_BASE}/pokemon/${q}`);
      location.href = `detail.html?name=${q}`;
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

        suggestionsDiv.innerHTML = matches.map((p, idx) => `
          <div class="suggestion-item" data-index="${idx}" onclick="location.href='detail.html?name=${p.name}'">
            <div class="suggestion-name">${p.name}</div>
          </div>
        `).join('');
      }catch(e){
        suggestionsDiv.innerHTML = `<div class="suggestion-item no-results">${t('errorLoading')}</div>`;
      }
    }, 300);
  });

  input?.addEventListener('keydown', (e)=>{
    const items = suggestionsDiv.querySelectorAll('.suggestion-item:not(.no-results)');
    if(items.length === 0) return;
    
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, items.length - 1);
      items.forEach((item, idx) => item.style.background = idx === currentSuggestionIndex ? '#f5f5f5' : '');
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
      items.forEach((item, idx) => item.style.background = idx === currentSuggestionIndex ? '#f5f5f5' : '');
    } else if(e.key === 'Enter' && currentSuggestionIndex >= 0){
      e.preventDefault();
      items[currentSuggestionIndex].click();
    }
  });

  input?.addEventListener('blur', ()=>{
    setTimeout(()=> suggestionsDiv.innerHTML = '', 200);
  });

  select?.addEventListener('change', ()=>{
    const val = select.value;
    const qsStr = `?page=1${val && val !== 'all' ? `&type=${encodeURIComponent(val)}` : ''}`;
    history.pushState({},'', qsStr);
    loadList(1, val);
  });
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

async function loadTypes(){
  try{
    const data = await fetchJson(`${API_BASE}/type`);
    const select = document.getElementById('typeSelect');
    if(!select) return;
    data.results.forEach(t=>{
      const opt = document.createElement('option'); 
      opt.value = t.name;
      const translated = typeTranslations[t.name]?.[appLang] || t.name;
      const display = translated.charAt(0).toUpperCase() + translated.slice(1);
      opt.textContent = display;
      select.appendChild(opt);
    });
    // Preserve selected type from URL (if any)
    const current = qs('type', 'all');
    if(Array.from(select.options).some(o => o.value === current)) select.value = current;
  }catch(e){ console.warn('No se pudieron cargar tipos', e); }
}

function updateActiveFilterLabel(type){
  const el = document.getElementById('activeFilter');
  if(!el) return;
  if(!type || type === 'all'){
    el.innerHTML = '';
    return;
  }
  const translated = typeTranslations[type]?.[appLang] || type;
  const display = translated.charAt(0).toUpperCase() + translated.slice(1);
  el.innerHTML = `<div class="badge bg-info text-dark">${t('activeFilter')}: ${display}</div> <button id="clearFilter" class="btn btn-sm btn-link">${t('clearFilter')}</button>`;
  const btn = document.getElementById('clearFilter');
  btn?.addEventListener('click', (e)=>{ e.preventDefault(); history.pushState({},'', '?page=1'); const select = document.getElementById('typeSelect'); if(select) select.value = 'all'; loadList(1,'all'); });
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
