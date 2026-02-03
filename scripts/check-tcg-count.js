/**
 * Comprueba cuántas cartas tiene un Pokémon en la API Pokémon TCG.
 * Uso: node scripts/check-tcg-count.js [nombre-o-id]
 * Ejemplo: node scripts/check-tcg-count.js bulbasaur
 *          node scripts/check-tcg-count.js 1
 *
 * Si obtienes 404, la API puede requerir API key. Obtén una gratis en:
 * https://dev.pokemontcg.io
 * Luego: set POKEMON_TCG_API_KEY=tu-clave  (Windows) o export POKEMON_TCG_API_KEY=tu-clave (Linux/Mac)
 */

const TCG_BASE = 'https://api.pokemontcg.io/v2';
const nameOrId = process.argv[2] || 'bulbasaur';
const apiKey = process.env.POKEMON_TCG_API_KEY;

async function getPokemonNameById(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  if (!res.ok) return 'bulbasaur';
  const data = await res.json();
  return data.name || 'bulbasaur';
}

function tcgFetch(url) {
  const opts = { headers: {} };
  if (apiKey) opts.headers['X-Api-Key'] = apiKey;
  return fetch(url, opts);
}

async function main() {
  const searchName = isNaN(Number(nameOrId)) ? nameOrId : await getPokemonNameById(nameOrId);
  const q = encodeURIComponent(`name:${searchName}`);
  const url = `${TCG_BASE}/cards?q=${q}&pageSize=1`;
  try {
    const res = await tcgFetch(url);
    if (!res.ok) {
      const body = await res.text();
      let msg = body;
      try {
        const j = JSON.parse(body);
        msg = j.error?.message || body;
      } catch (_) {}
      console.log('Error API:', res.status, res.statusText);
      console.log('URL:', url);
      if (msg) console.log('Respuesta:', msg);
      if (res.status === 404 && !apiKey) {
        console.log('\nPrueba con API key (gratis en https://dev.pokemontcg.io):');
        console.log('  set POKEMON_TCG_API_KEY=tu-clave');
      }
      return;
    }
    const json = await res.json();
    const total = json.totalCount ?? json.count ?? 0;
    console.log(`Pokémon: ${searchName} (nombre usado en búsqueda TCG)`);
    console.log(`Cartas en Pokémon TCG API: ${total}`);
  } catch (e) {
    console.error('Error:', e.message);
    console.log('URL usada:', url);
  }
}

main();
