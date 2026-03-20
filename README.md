# Map Urea Generator

Herramienta web para editar y exportar mapas coropléticos de productores de urea en SVG o PNG.

## Stack

- React
- Vite
- D3

## Desarrollo local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Build

```bash
npm run build
```

## Publicar en GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <TU_REPO>
git push -u origin main
```

## Notas

- El mapa mundial se descarga en runtime desde `world-atlas` en jsDelivr.
- Las banderas están embebidas como data URI dentro del código.
