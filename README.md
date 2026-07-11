# Molins Dansa 2026

Aplicació web del concurs de vídeos de dansa en espais públics de Molins de Rei,
organitzat per l'**Associació Dance Space**. Els participants inscriuen un enllaç
(YouTube / Instagram), el públic vota i les actuacions es mostren en una galeria
i en un mapa interactiu.

## Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **Firebase**: Authentication (email/contrasenya + anònim) i Firestore
- **Leaflet** + `react-leaflet` + `markercluster` per al mapa
- Desplegament: **Firebase Hosting**

## Posada en marxa

```bash
# 1. Instal·la dependències
npm install

# 2. Configura Firebase
cp .env.example .env      # i omple els valors (veure .env.example)

# 3. Arrenca en desenvolupament
npm run dev
```

Altres scripts:

```bash
npm run build     # build de producció a dist/
npm run preview   # serveix el build localment
npm run lint      # ESLint
```

## Desplegament

```bash
npm run build
firebase deploy --only hosting                 # publica el web
firebase deploy --only firestore:rules         # publica les regles de seguretat
```

> **Important:** les regles de `firestore.rules` són la barrera de seguretat real
> del concurs (integritat dels vots, protecció de dades). Reviseu i proveu els canvis
> amb l'emulador abans de desplegar-les. Veure el pla de millora del projecte.

## Estructura actual

Tota la lògica viu, de moment, a `src/App.jsx`. El pla de refactor preveu dividir-la
en `lib/`, `components/ui/`, `features/{auth,videos,voting,map,admin}/` i `pages/`.

```
src/
  App.jsx        # tota l'app (vistes, components, lògica Firebase)
  firebase.js    # inicialització de Firebase des de variables VITE_FIREBASE_*
  main.jsx       # punt d'entrada
  index.css      # @import "tailwindcss"
firestore.rules  # regles de seguretat de Firestore
firebase.json    # config de Hosting + Firestore
```
