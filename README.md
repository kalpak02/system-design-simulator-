# System Design Simulator

A Vite + React + TypeScript application for simulating distributed system behavior, traffic spikes, defense controls, and architecture topology changes.

## Features

- interactive node-based system diagram
- drag-and-drop topology building
- live simulation metrics
- chaos engineering controls
- defense controls and system health monitoring
- dark, polished dashboard UI

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- @xyflow/react
- Recharts

## Installation

From the project root:

```bash
npm install
```

## Running the app

Start the dev server:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the local URL shown in the terminal, usually:

```bash
http://localhost:5173/
```

## Production build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview -- --host 0.0.0.0
```

## Linting

```bash
npm run lint
```

## Notes

- The project expects to run from the app folder: `system-design-sim`
- Use the Vite dev server from that folder, not the parent directory
- The application includes a working demo topology and live simulation loop by default
