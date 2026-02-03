/**
 * Configuración global: API y utilidades de URL.
 */

export const API_BASE = 'https://pokeapi.co/api/v2';
export const LIMIT = 50;

/** Pokémon TCG API (cartas oficiales). Sin API key; registro opcional para más rate limit. */
export const TCG_API_BASE = 'https://api.pokemontcg.io/v2';
export const TCG_CARDS_MAX = 5;

/**
 * Obtiene un parámetro de la query string de la URL.
 * @param {string} name - Nombre del parámetro
 * @param {*} defaultVal - Valor por defecto si no existe
 */
export function qs(name, defaultVal) {
  const params = new URLSearchParams(location.search);
  return params.get(name) ?? defaultVal;
}
