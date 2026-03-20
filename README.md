# Bong Map Tool

Herramienta web para editar, ajustar y exportar mapas coropléticos con etiquetas flotantes, banderas y porcentajes.

El proyecto está pensado para un flujo editorial rápido: cargar una lista de países con valores, ajustar la composición visual del mapa y exportar el resultado en `SVG` o `PNG`.

## Qué hace

- Colorea países en un mapa mundial según el valor cargado.
- Muestra porcentajes sobre el mapa.
- Dibuja badges arrastrables con bandera y nombre del país.
- Permite reacomodar badges manualmente o resolver solapamientos automáticamente.
- Exporta el resultado final en `SVG` y `PNG`.
- Permite incluir o excluir título y fuente del arte final.

## Stack

- React
- Vite
- D3

## Estructura

- [src/App.jsx](/Users/marcoscousseau/Documents/GitHub/bong-map-tool/src/App.jsx): lógica principal, interfaz, exportación y render del mapa.
- [src/main.jsx](/Users/marcoscousseau/Documents/GitHub/bong-map-tool/src/main.jsx): bootstrap de la app.
- [src/styles.css](/Users/marcoscousseau/Documents/GitHub/bong-map-tool/src/styles.css): estilos globales mínimos.
- [vite.config.js](/Users/marcoscousseau/Documents/GitHub/bong-map-tool/vite.config.js): configuración de build y base path para GitHub Pages.
- [docs/](/Users/marcoscousseau/Documents/GitHub/bong-map-tool/docs): salida de producción publicada por GitHub Pages.

## Desarrollo local

Instalación:

```bash
npm install
```

Servidor de desarrollo:

```bash
npm run dev
```

Abrir en:

```txt
http://localhost:5173/
```

Importante: en desarrollo local no hay que abrir `/bong-map-tool/`. Ese subpath se usa solo en la publicación de GitHub Pages.

## Build de producción

```bash
npm run build
```

El build se genera en `docs/`, porque el repo está configurado para publicar GitHub Pages desde `main` + `/docs`.

Para previsualizar el build final:

```bash
npm run preview
```

## Publicación en GitHub Pages

El proyecto está preparado para publicarse en:

```txt
https://bongstudio-dev.github.io/bong-map-tool/
```

Configuración esperada de GitHub Pages:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

Flujo recomendado:

```bash
npm run build
git add .
git commit -m "Update map tool"
git push
```

## Flujo de uso

### 1. Cargar datos

En la sección `Datos` se define la lista de países y sus porcentajes.

- Cada fila contiene país y valor.
- Se pueden agregar o borrar filas.
- El input de país tiene autocomplete con nombres canónicos.
- La búsqueda tolera variantes y diferencias de acentos.

Ejemplos:

- `Mexico` se normaliza a `México`
- `Iran` se normaliza a `Irán`
- `USA` se normaliza a `EEUU`

### 2. Ajustar la visualización

Controles principales:

- `Escala mapa`
- `Stroke mapa`
- `Tamano %`
- `Linea conector`

Controles avanzados de badges:

- `Ajustes badge` es un bloque plegable.
- Ahí se agrupan todos los controles finos del badge.

Parámetros de badge disponibles:

- `Escala badge`
- `Padding badge`
- `Escala bandera`
- `Radio badge`
- `Stroke badge`

### 3. Posicionar badges

- Los badges se pueden arrastrar manualmente.
- El mapa también se puede arrastrar para panear.
- `Resolver overlap` intenta redistribuir badges para reducir cruces y superposiciones.
- `Copiar posiciones` genera un bloque reutilizable con posiciones iniciales.

### 4. Exportar

- `Exportar SVG`
- `Exportar PNG`

La opción `Incluir titulo y fuente` controla si el arte final incluye o no:

- bloque superior con título
- bloque inferior con fuente

Está apagada por defecto para facilitar exportaciones limpias.

## Decisiones de implementación

### Banderas

Las banderas se cargan desde Iconify usando el set `emojione-v1`, y luego se convierten a `data:` URIs dentro de la app para usarlas en render y exportación.

Esto evita mantener un bloque enorme de SVGs inline y mantiene compatibilidad razonable con la exportación.

### Mapa mundial

El mapa se descarga en runtime desde `world-atlas` vía jsDelivr:

- `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`

### Etiquetas

Los badges usan:

- fondo blanco
- borde azul `#4086FF`
- texto azul `#4086FF`
- bandera recortada sin contenedor gris extra

Los valores por defecto quedaron ajustados a partir de referencias visuales y mediciones de Figma/SVG.

## Limitaciones actuales

- La disponibilidad del mapa depende de la descarga remota de `world-atlas`.
- La disponibilidad de banderas depende de la API pública de Iconify al momento de cargarlas.
- El autocomplete de países está hecho con lógica local simple; no usa una librería externa de combobox.
- La posición inicial de badges está optimizada para este set de países, pero puede requerir ajustes manuales para otros datasets.

## Próximas mejoras posibles

- Mostrar la bandera dentro de las sugerencias del autocomplete.
- Agregar control independiente del gap entre bandera y texto.
- Persistir presets visuales.
- Importar y exportar datasets en JSON o CSV.

## Licencias y fuentes

- Banderas: Emoji One v1, licencia `CC BY-SA 4.0`
- Servicio de iconos: [Iconify](https://iconify.design/)
- Geometría del mapa: [world-atlas](https://github.com/topojson/world-atlas)
