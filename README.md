# Siloam 2027 Church Experience

A standalone interactive Three.js experience for the Layers of Truth SILOAM 2027 conference.

## Run locally

Use any static server from this folder. For example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`. The page uses a CDN for Three.js and embedded YouTube video, so an internet connection is required for those parts.

## Project structure

- `index.html` — application shell
- `assets/` — 3D scene code, styling, audio, and minister images
- `references/` — original church reference imagery
- `legacy-prototype/` — the earlier standalone prototype, preserved for reference
