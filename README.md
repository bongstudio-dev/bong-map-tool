# Bong Map Tool

Herramienta de visualización de mapas choropleth por [Bong Studio](https://bongstudio.ar).

Permite crear mapas mundiales con escala cromática basada en datos tabulares, etiquetas con banderas arrastrables, y exportar a SVG o PNG.

## Uso

**Online:** [bongstudio.github.io/bong-map-tool](https://bongstudio.github.io/bong-map-tool)

**Local:**
```bash
npm install
npm run dev
```

## Features

- Tabla de datos editable (país + valor porcentual)
- Mapa choropleth con escala cromática automática
- Etiquetas con banderas (Emoji One v1) arrastrables
- Porcentajes sobre cada país con auto-contraste
- Controles visuales: escala, stroke, tamaños, radios
- Paneo del mapa con drag
- Anti-overlap de etiquetas
- Exportar posiciones como código JS
- Exportar SVG y PNG (3x)

## Banderas

Emoji One v1 — CC BY-SA 4.0

## Stack

Vite + React + D3
