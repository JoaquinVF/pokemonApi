const API_BASE = 'https://pokeapi.co/api/v2';
const LIMIT = 50;

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

// Returns object { es, en }
async function fetchTypeNames(typeKey){
  if(typeNameCache[typeKey]) return typeNameCache[typeKey];
  try{
    const data = await fetchJson(`${API_BASE}/type/${typeKey}`);
    const es = (data.names||[]).find(n=>n.language?.name==='es')?.name || null;
    const en = (data.names||[]).find(n=>n.language?.name==='en')?.name || typeKey;
    typeNameCache[typeKey] = { es, en };
    return typeNameCache[typeKey];
  }catch(e){
    const fallback = { es: null, en: typeKey };
    typeNameCache[typeKey] = fallback;
    return fallback;
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
      const names = await fetchTypeNames(t.type.name);
      // show Spanish with English in parentheses when Spanish exists
      const disp = names.es && names.es !== names.en ? `${names.es} (${names.en})` : (names.es || names.en);
      return `<span class="type">${disp}</span>`;
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
    name.style.fontSize = '0.8rem';
    name.style.color = '#666';
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
      pageInfo.textContent = `Página ${page} — ${offset+1}–${Math.min(offset+LIMIT, data.count)} de ${data.count}`;
      prevBtn.disabled = !data.previous;
      nextBtn.disabled = !data.next;

      currentDetails = await Promise.all(data.results.map(r=>fetchJson(r.url).catch(()=>null)));
    } else {
      // Fetch pokemons for the selected type and paginate the results client-side
      const typeData = await fetchJson(`${API_BASE}/type/${type}`);
      const allOfType = (typeData.pokemon || []).map(p => p.pokemon);
      const total = allOfType.length;
      pageInfo.textContent = `Página ${page} — ${offset+1}–${Math.min(offset+LIMIT, total)} de ${total}`;
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
    wrap.innerHTML = `<p>Error cargando pokemones: ${e.message}</p>`;
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
          <h2 class="mb-3">Información del Pokémon</h2>
          <div class="mb-3">
            <strong>Tipos:</strong>
              <div class="mt-2">${(await Promise.all(p.types.map(async t=> `<span class="badge bg-danger">${await fetchTypeDisplayName(t.type.name)}</span>`)) ).join(' ')}</div>
          </div>
          <p><strong>Altura:</strong> ${p.height / 10} m</p>
          <p><strong>Peso:</strong> ${p.weight / 10} kg</p>
          <p><strong>Habilidades:</strong> ${abilities}</p>
          <h4 class="mt-4">Estadísticas Base</h4>
          <div class="row">
            ${p.stats.map(s=>`
              <div class="col-md-6 mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <strong>${s.stat.name}</strong>
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
        <h3 class="mb-3">Movimientos (algunos)</h3>
        <div>${p.moves.slice(0,12).map(m=>`<span class="badge bg-secondary me-2 mb-2 move-badge" data-url="${m.move.url}">${m.move.name}</span>`).join('')}</div>
      </section>
    `;
    // attach hover handlers for move tooltips
    try{ attachMoveHover(container); }catch(e){/* no-op */}
  }catch(e){ container.innerHTML = `<p>Error cargando detalle: ${e.message}</p>` }
}

document.addEventListener('DOMContentLoaded', ()=>{
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
      showErrorToast('No se encontró ese Pokémon. Prueba con el nombre exacto en inglés.');
    }
  });

  input?.addEventListener('input', async (e)=>{
    clearTimeout(suggestionTimeout);
    const q = e.target.value.trim().toLowerCase();
    
    if(!q){
      suggestionsDiv.innerHTML = '';
      return;
    }

    suggestionTimeout = setTimeout(async ()=>{
      try{
        const data = await fetchJson(`${API_BASE}/pokemon?limit=1000`);
        const matches = data.results.filter(p => p.name.includes(q)).slice(0, 8);
        
        if(matches.length === 0){
          suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">No hay resultados</div>';
          return;
        }

        suggestionsDiv.innerHTML = matches.map(p => `
          <div class="suggestion-item" onclick="location.href='detail.html?name=${p.name}'">
            <div class="suggestion-name">${p.name}</div>
          </div>
        `).join('');
      }catch(e){
        suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">Error cargando sugerencias</div>';
      }
    }, 300);
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
      const opt = document.createElement('option'); opt.value = t.name; opt.textContent = t.name; select.appendChild(opt);
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
  el.innerHTML = `<div class="badge bg-info text-dark">Filtro activo: ${type}</div> <button id="clearFilter" class="btn btn-sm btn-link">(limpiar)</button>`;
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
  const nameEs = (m.names||[]).find(n=>n.language?.name==='es')?.name;
  const nameEn = (m.names||[]).find(n=>n.language?.name==='en')?.name;
  const moveName = nameEs || nameEn || m.name;
  const effectEs = (m.effect_entries||[]).find(e=>e.language?.name==='es')?.short_effect || (m.flavor_text_entries||[]).find(e=>e.language?.name==='es')?.flavor_text;
  const effectEn = (m.effect_entries||[]).find(e=>e.language?.name==='en')?.short_effect || (m.flavor_text_entries||[]).find(e=>e.language?.name==='en')?.flavor_text;
  const effect = effectEs || effectEn || '';
  const typeKey = m.type?.name || (m.type && m.type.name) || null;
  const typeDisplay = typeKey ? await fetchTypeDisplayName(typeKey) : (m.type?.name || '-');
  return `
    <div style="font-weight:600;text-transform:capitalize">${moveName}</div>
    <div class="muted">Tipo: ${typeDisplay} — PP: ${m.pp ?? '-'} — Potencia: ${m.power ?? '-'} — Precisión: ${m.accuracy ?? '-'}</div>
    <div style="margin-top:6px">${effect}</div>
  `;
}
