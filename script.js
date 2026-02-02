const API_BASE = 'https://pokeapi.co/api/v2';
const LIMIT = 20;

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
    const card = document.createElement('article');
    card.className = 'card';
    card.addEventListener('click', ()=> location.href = `detail.html?name=${pokemon.name}`);
    const img = document.createElement('div'); img.className='sprite';
    const spriteUrl = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || '';
    img.innerHTML = spriteUrl? `<img src="${spriteUrl}" alt="${pokemon.name}" loading="lazy" style="max-width:100%;height:auto">` : '';
    const title = document.createElement('div'); title.className='pokemon-name'; title.textContent = `#${pokemon.id} ${pokemon.name}`;
    const meta = document.createElement('div'); meta.className='meta';
    pokemon.types.forEach(t=>{
      const span = document.createElement('span'); span.className='type'; span.textContent = t.type.name; meta.appendChild(span);
    });
    card.appendChild(img); card.appendChild(title); card.appendChild(meta);
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
      <div class="detail-top">
        <div class="detail-sprite">${sprite? `<img src="${sprite}" alt="${p.name}" style="max-width:100%;height:auto">` : ''}</div>
        <div class="detail-body">
          <p><strong>Tipos:</strong> ${types}</p>
          <p><strong>Altura:</strong> ${p.height / 10} m — <strong>Peso:</strong> ${p.weight / 10} kg</p>
          <p><strong>Habilidades:</strong> ${abilities}</p>
          <div class="stats">${statsHtml}</div>
        </div>
      </div>
      <section style="margin-top:12px">
        <h3>Movimientos (algunos)</h3>
        <div class="meta">${p.moves.slice(0,8).map(m=>`<span class="type">${m.move.name}</span>`).join('')}</div>
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
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const q = input.value.trim().toLowerCase();
    if(!q) return;
    try{
      await fetchJson(`${API_BASE}/pokemon/${q}`);
      location.href = `detail.html?name=${q}`;
    }catch(_){
      alert('No se encontró ese Pokémon. Prueba con el nombre exacto en inglés.');
    }
  });
  select?.addEventListener('change', ()=> renderCards(currentDetails.filter(Boolean)));
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
