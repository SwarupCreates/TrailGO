# Offline GPX Navigator

A React, TypeScript, Vite, and Tailwind CSS Progressive Web App starter for offline GPX route navigation.

## What is included

- Vite React app with TypeScript
- Tailwind CSS styling
- PWA registration through `vite-plugin-pwa` and Workbox
- Zustand app state
- Dexie IndexedDB storage
- MapLibre GL JS route rendering placeholder
- Turf.js route metrics placeholder
- Local GPX parser placeholder
- GPS and device orientation service placeholders

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Project Folders

- `src/app` - app shell and global store
- `src/components` - reusable UI and map components
- `src/hooks` - React hooks for GPS, imports, and route state
- `src/pages` - top-level pages
- `src/services` - GPS, GPX, navigation, and map domain services
- `src/storage` - IndexedDB setup
- `src/workers` - background worker entry points
- `src/types` - shared TypeScript types
