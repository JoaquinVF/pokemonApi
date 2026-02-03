/**
 * Llamadas a la PokéAPI y datos derivados (tipos, debilidades, evolución).
 */

import { API_BASE } from './config.js';
import { getAppLang, typeTranslations } from './translations.js';

/** Petición GET a una URL y parseo de JSON. */
export async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

const typeNameCache = {};
const speciesStageCache = {};

/** Nombre del tipo en el idioma actual (capitalizado). */
export async function fetchTypeDisplayName(typeKey) {
  const cacheKey = `${typeKey}_${getAppLang()}`;
  if (typeNameCache[cacheKey] !== undefined) return typeNameCache[cacheKey];
  try {
    let display = typeTranslations[typeKey]?.[getAppLang()] || typeKey;
    display = display.charAt(0).toUpperCase() + display.slice(1);
    typeNameCache[cacheKey] = display;
    return display;
  } catch (e) {
    typeNameCache[cacheKey] = typeKey;
    return typeKey;
  }
}

/** Debilidades (x2, x4...) según los tipos del Pokémon. */
export async function getPokemonWeaknesses(pokemonTypes) {
  const multipliers = {};
  for (const t of pokemonTypes) {
    const typeData = await fetchJson(`${API_BASE}/type/${t.type.name}`);
    const dmg = typeData.damage_relations;
    dmg.double_damage_from.forEach(d => { multipliers[d.name] = (multipliers[d.name] ?? 1) * 2; });
    dmg.half_damage_from.forEach(d => { multipliers[d.name] = (multipliers[d.name] ?? 1) * 0.5; });
    dmg.no_damage_from.forEach(d => { multipliers[d.name] = 0; });
  }
  return Object.entries(multipliers)
    .filter(([, m]) => m > 1)
    .map(([type, multiplier]) => ({ type, multiplier }));
}

/** Resistencias e inmunidades según los tipos del Pokémon. */
export async function getPokemonResistances(pokemonTypes) {
  const multipliers = {};
  for (const t of pokemonTypes) {
    const typeData = await fetchJson(`${API_BASE}/type/${t.type.name}`);
    const dmg = typeData.damage_relations;
    dmg.half_damage_from.forEach(d => { multipliers[d.name] = (multipliers[d.name] ?? 1) * 0.5; });
    dmg.no_damage_from.forEach(d => { multipliers[d.name] = 0; });
  }
  return Object.entries(multipliers)
    .filter(([, m]) => m < 1)
    .map(([type, multiplier]) => ({ type, multiplier }));
}

/** Cadena de evolución con detalle (trigger, item, nivel, felicidad). */
export async function getEvolutionChainWithDetails(pokemonId) {
  const pokemon = await fetchJson(`${API_BASE}/pokemon/${pokemonId}`);
  const species = await fetchJson(pokemon.species.url);
  const chainData = await fetchJson(species.evolution_chain.url);
  const chain = [];
  function traverse(node) {
    const d = node.evolution_details?.[0];
    chain.push({
      name: node.species.name,
      minLevel: d?.min_level ?? null,
      item: d?.item?.name ?? null,
      trigger: d?.trigger?.name ?? null,
      minHappiness: d?.min_happiness ?? null,
      minAffection: d?.min_affection ?? null,
      tradeSpecies: d?.trade_species?.name ?? null,
    });
    if (node.evolves_to?.length > 0) traverse(node.evolves_to[0]);
  }
  traverse(chainData.chain);
  return chain;
}

/** Cadena de evolución simplificada (nombre, minLevel). */
export async function getEvolutionChain(pokemonId) {
  const full = await getEvolutionChainWithDetails(pokemonId);
  return full.map(e => ({ name: e.name, minLevel: e.minLevel }));
}

/** Lista de encuentros por location_area (zonas donde aparece el Pokémon). URL relativa en pokemon.location_area_encounters. */
export async function getPokemonEncounters(encountersUrl) {
  if (!encountersUrl) return [];
  try {
    const url = encountersUrl.startsWith('http') ? encountersUrl : `https://pokeapi.co${encountersUrl}`;
    const data = await fetchJson(url);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

/** Fase evolutiva de una especie: 'baby' | 'base' | 'stage1' | 'stage2'. */
export async function getSpeciesEvolutionStage(speciesName) {
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
