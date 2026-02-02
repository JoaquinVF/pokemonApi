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
    name.textContent = pokemon.name;
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

async function loadList(pageArg, typeArg){
  const page = Number(pageArg ?? qs('page', '1'));
  const type = typeArg ?? qs('type', 'all');
  const offset = (page-1)*LIMIT;
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  try{
    if(type === 'all'){
      const listUrl = `${API_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`;
      const data = await fetchJson(listUrl);
      pageInfo.textContent = `${t('pageTitle')} ${page} — ${offset+1}–${Math.min(offset+LIMIT, data.count)} ${t('of')} ${data.count}`;
      prevBtn.disabled = !data.previous;
      nextBtn.disabled = !data.next;

      currentDetails = await Promise.all(data.results.map(r=>fetchJson(r.url).catch(()=>null)));
    } else {
      // Fetch pokemons for the selected type and paginate the results client-side
      const typeData = await fetchJson(`${API_BASE}/type/${type}`);
      const allOfType = (typeData.pokemon || []).map(p => p.pokemon);
      const total = allOfType.length;
      pageInfo.textContent = `${t('pageTitle')} ${page} — ${offset+1}–${Math.min(offset+LIMIT, total)} ${t('of')} ${total}`;
      prevBtn.disabled = page <= 1;
      nextBtn.disabled = offset + LIMIT >= total;

      const slice = allOfType.slice(offset, offset + LIMIT);
      currentDetails = await Promise.all(slice.map(p => fetchJson(p.url).catch(()=>null)));
    }

    await renderCards(currentDetails.filter(Boolean));
    updateActiveFilterLabel(type);

    const basePageParam = (n) => `?page=${n}${type && type !== 'all' ? `&type=${encodeURIComponent(type)}` : ''}`;
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
    title.textContent = `#${p.id} ${p.name}`;
    const sprite = p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default || '';
    const types = (await Promise.all(p.types.map(async t=> await fetchTypeDisplayName(t.type.name)))).join(', ');
    const abilities = p.abilities.map(a=>a.ability.name).join(', ');
    const statsHtml = p.stats.map(s=>`<div class="stat"><strong>${s.stat.name}</strong><div>${s.base_stat}</div></div>`).join('');

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
          <p><strong>${t('height')}:</strong> ${p.height / 10} ${t('m')}</p>
          <p><strong>${t('weight')}:</strong> ${p.weight / 10} ${t('kg')}</p>
          <p><strong>${t('abilities')}:</strong> ${abilities}</p>
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
