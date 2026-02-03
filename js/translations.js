/**
 * Traducciones: idioma de la app (es/en) y textos traducidos para la interfaz.
 */

let appLang = 'es';

export const typeTranslations = {
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
    pageTitle: 'Página', of: 'de', all: 'Todos los tipos', search: 'Buscar por nombre (ej. pikachu)',
    searchBtn: 'Buscar', filterBtn: 'Filtrar por tipo', activeFilter: 'Filtro activo', clearFilter: '(limpiar)',
    prev: 'Anterior', next: 'Siguiente', notFound: 'No se encontró ese Pokémon. Prueba con el nombre exacto en inglés.',
    noResults: 'No hay resultados', height: 'Altura', weight: 'Peso', m: 'm', kg: 'kg', types: 'Tipos',
    abilities: 'Habilidades', baseStats: 'Estadísticas Base', moves: 'Movimientos (algunos)', back: '← Volver',
    loading: 'Cargando...', error: 'Error cargando pokemones', errorDetail: 'Error cargando detalle', errorLoading: 'Error cargando información',
    type: 'Tipo', power: 'Potencia', accuracy: 'Precisión', pp: 'PP', pokemonInfo: 'Información del Pokémon',
    webCreatedBy: 'Web creada por Joaquin L. Villanueva Farber', apiUsed: 'API usada', weakness: 'Debilidad',
    resistance: 'Resistencia', immune: 'Inmune', evolution: 'Evolución', shiny: 'Shiny', normal: 'Normal', playCry: 'Reproducir grito',
    advancedSearch: 'Búsqueda avanzada', filterByTypes: 'Filtro por tipos (selección múltiple)', filterByPhase: 'Filtro por fase',
    filterByRegion: 'Filtro por región', filterByGeneration: 'Filtro por generación', allPhases: 'Todas', phaseBaby: 'Bebé',
    phaseBase: 'Base', phaseStage1: 'Etapa 1', phaseStage2: 'Etapa 2 (evolución final)', allRegions: 'Todas', allGenerations: 'Todas',
    applyFilters: 'Aplicar filtros', clearFilters: 'Limpiar', legendary: 'Legendario', mythical: 'Mítico', baby: 'Bebé',
    levelUp: 'Subir de nivel', useItem: 'Usar objeto', trade: 'Intercambio', happiness: 'Felicidad', item: 'Objeto', values: 'Valores',
    habitat: 'Hábitat', whereToFind: 'Dónde encontrarlo', noHabitat: '—', noLocations: 'No hay datos de ubicación.', alsoIn: 'También en',
  },
  en: {
    pageTitle: 'Page', of: 'of', all: 'All types', search: 'Search by name (e.g. pikachu)',
    searchBtn: 'Search', filterBtn: 'Filter by type', activeFilter: 'Active filter', clearFilter: '(clear)',
    prev: 'Previous', next: 'Next', notFound: 'Pokemon not found. Try the exact English name.', noResults: 'No results',
    height: 'Height', weight: 'Weight', m: 'm', kg: 'kg', types: 'Types', abilities: 'Abilities', baseStats: 'Base Stats',
    moves: 'Moves (some)', back: '← Back', loading: 'Loading...', error: 'Error loading pokemons', errorDetail: 'Error loading detail',
    errorLoading: 'Error loading information', type: 'Type', power: 'Power', accuracy: 'Accuracy', pp: 'PP',
    pokemonInfo: 'Pokemon Information', webCreatedBy: 'Web created by Joaquin L. Villanueva Farber', apiUsed: 'API used',
    weakness: 'Weakness', resistance: 'Resistance', immune: 'Immune', evolution: 'Evolution', shiny: 'Shiny', normal: 'Normal',
    playCry: 'Play cry', advancedSearch: 'Advanced search', filterByTypes: 'Filter by types (multi-select)', filterByPhase: 'Filter by phase',
    filterByRegion: 'Filter by region', filterByGeneration: 'Filter by generation', allPhases: 'All', phaseBaby: 'Baby', phaseBase: 'Base',
    phaseStage1: 'Stage 1', phaseStage2: 'Stage 2 (final evolution)', allRegions: 'All', allGenerations: 'All',
    applyFilters: 'Apply filters', clearFilters: 'Clear', legendary: 'Legendary', mythical: 'Mythical', baby: 'Baby',
    levelUp: 'Level up', useItem: 'Use item', trade: 'Trade', happiness: 'Happiness', item: 'Item', values: 'Values',
    habitat: 'Habitat', whereToFind: 'Where to find', noHabitat: '—', noLocations: 'No location data.', alsoIn: 'Also in',
  },
};

/** Nombres de hábitat de la API (grassland, cave, etc.) → texto legible. */
export const habitatNames = {
  cave: { es: 'Cueva', en: 'Cave' }, grassland: { es: 'Pradera', en: 'Grassland' }, mountain: { es: 'Montaña', en: 'Mountain' },
  rare: { es: 'Raro', en: 'Rare' }, 'rough-terrain': { es: 'Terreno accidentado', en: 'Rough terrain' }, sea: { es: 'Mar', en: 'Sea' },
  urban: { es: 'Urbano', en: 'Urban' }, 'waters-edge': { es: 'Orilla del agua', en: 'Water\'s edge' },
};

/** Métodos de encuentro de la API (walk, surf, etc.) → texto legible. */
export const encounterMethodNames = {
  walk: { es: 'Caminar (hierba/cueva)', en: 'Walk (grass/cave)' }, surf: { es: 'Surf', en: 'Surf' },
  'old-rod': { es: 'Caña vieja', en: 'Old rod' }, 'good-rod': { es: 'Caña buena', en: 'Good rod' }, 'super-rod': { es: 'Super caña', en: 'Super rod' },
  'headbutt': { es: 'Cabezazo', en: 'Headbutt' }, 'rock-smash': { es: 'Golpe roca', en: 'Rock smash' },
};

/** Devuelve el texto traducido para la clave dada. */
export function t(key) {
  return translations[appLang]?.[key] || translations['es']?.[key] || key;
}

/** Devuelve el nombre traducido de una estadística (PS, Ataque, etc.). */
export function getStatTranslation(statName) {
  return statTranslations[statName]?.[appLang] || statName;
}

/** Idioma actual de la app ('es' | 'en'). */
export function getAppLang() {
  return appLang;
}

/** Establece el idioma de la app. */
export function setAppLang(lang) {
  appLang = lang;
}
