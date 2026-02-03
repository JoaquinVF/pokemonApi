# Módulos JavaScript (ES Modules)

Estructura del refactor para que sea fácil de seguir:

| Archivo | Responsabilidad |
|---------|-----------------|
| **main.js** | Punto de entrada: idioma, footer, botones; inicia listado o detalle según la página. |
| **config.js** | Constantes (API, límite) y utilidad `qs()` para leer la URL. |
| **translations.js** | Idioma de la app, traducciones (tipos, stats, textos) y funciones `t()`, `getStatTranslation()`. |
| **api.js** | Llamadas a PokéAPI: `fetchJson`, tipos, debilidades, resistencias, cadenas de evolución. |
| **filters.js** | Filtros (tipos, fase, región, generación) y sincronización con la URL. |
| **list.js** | Página de listado: tarjetas, paginación, `loadList()`, etiqueta de filtros activos. |
| **detail.js** | Página de detalle de un Pokémon: datos, estadísticas, evolución, shiny, gritos. |
| **search.js** | Búsqueda por nombre, sugerencias, acordeón de filtros, carga de tipos/regiones/generaciones. |
| **tooltips.js** | Tooltips al pasar el ratón sobre movimientos y habilidades. |

El HTML carga solo `js/main.js` con `type="module"`; el resto se importa desde ahí.
