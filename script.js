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

function renderCards(list){
  const wrap = document.getElementById('pokemon-list');
  const typeFilter = document.getElementById('typeSelect')?.value || 'all';
  wrap.innerHTML = '';
  list.forEach(pokemon=>{
    if(!pokemon) return;
    if(typeFilter !== 'all' && !pokemon.types.some(t=>t.type.name === typeFilter)) return;
    const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
    const typesHtml = pokemon.types.map(t=>`<span class="type">${t.type.name}</span>`).join('');
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
  });
}

async function loadList(){
  const page = Number(qs('page', '1'));
  const offset = (page-1)*LIMIT;
  const listUrl = `${API_BASE}/pokemon?limit=${LIMIT}&offset=${offset}`;
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  try{
    const data = await fetchJson(listUrl);
    pageInfo.textContent = `Página ${page} — ${offset+1}–${Math.min(offset+LIMIT, data.count)} de ${data.count}`;
    prevBtn.disabled = !data.previous;
    nextBtn.disabled = !data.next;

    currentDetails = await Promise.all(data.results.map(r=>fetchJson(r.url).catch(()=>null)));
    renderCards(currentDetails.filter(Boolean));

    prevBtn.onclick = ()=> { if(page>1) location.search = `?page=${page-1}` };
    nextBtn.onclick = ()=> { if(data.next) location.search = `?page=${page+1}` };
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
    const types = p.types.map(t=>t.type.name).join(', ');
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
            <div class="mt-2">${p.types.map(t=>`<span class="badge bg-danger">${t.type.name}</span>`).join(' ')}</div>
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
        <div>${p.moves.slice(0,12).map(m=>`<span class="badge bg-secondary me-2 mb-2">${m.move.name}</span>`).join('')}</div>
      </section>
    `;
  }catch(e){ container.innerHTML = `<p>Error cargando detalle: ${e.message}</p>` }
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('pokemon-list')){
    loadList();
    initSearchAndFilters();
    loadTypes();
  }
  if(document.getElementById('detail')) loadDetail();
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

  select?.addEventListener('change', ()=> location.search = '?page=1');
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
  }catch(e){ console.warn('No se pudieron cargar tipos', e); }
}
