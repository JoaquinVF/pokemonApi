# Pokédex paginada (estática)

Pequeña web que muestra pokemones paginados usando la API pública de PokéAPI.

Archivos:
- `index.html` — Lista paginada de pokemones.
- `detail.html` — Página de detalle de un Pokémon (usa `?name=bulbasaur`).
- `styles.css` — Estilos responsivos.
- `script.js` — Lógica para listar y mostrar detalles.

Prueba local:

Usar un servidor estático (recomendado). Ejemplos:

Node (npx http-server):
```bash
npx http-server . -c-1
```

Python 3:
```bash
python -m http.server 8000
```

Luego abrir http://localhost:8000/index.html

Características añadidas:
- Búsqueda por nombre: escribe un nombre en inglés y presiona "Buscar" para ir a la página de detalle.
- Filtro por tipo: selecciona un tipo para filtrar las cartas mostradas en la página actual.

Deploy en GitHub Pages (rápido):

- Opción 1 (manual): crea un repositorio en GitHub, sube los archivos y activa GitHub Pages desde la rama `main` y carpeta `/ (root)` en Settings → Pages.
- Opción 2 (Actions): añade un workflow que publique la carpeta `./` en la rama `gh-pages` usando `peaceiris/actions-gh-pages`.

Ejemplo mínimo de workflow (`.github/workflows/gh-pages.yml`):
```yaml
name: Deploy to GitHub Pages
on:
	push:
		branches: [ main ]
jobs:
	deploy:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
			- name: Deploy
				uses: peaceiris/actions-gh-pages@v3
				with:
					github_token: ${{ secrets.GITHUB_TOKEN }}
					publish_dir: ./
```

Script local para crear commit y opcionalmente pushear
---------------------------------------------------
He añadido `scripts\git-deploy.ps1` para inicializar un repo Git localmente, crear un commit y, si proporcionas `-RemoteUrl`, añadir el remote y pushear.

Ejemplo (PowerShell):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd C:\Repositorio
.\scripts\git-deploy.ps1 -RemoteUrl "https://github.com/your-username/your-repo.git"
```

Si no quieres pushear automáticamente, ejecuta el script sin `-RemoteUrl` y luego añade el remote manualmente.


