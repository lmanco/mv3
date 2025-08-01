# Phaser 3 Platformer Demo

This project is a Phaser 3 platformer featuring double jump, dust cloud effects, and basic player movement.

## Getting Started

### Prerequisites
- Node.js v22
- npm (comes with Node.js)

### Install Dependencies

Open a terminal in the project root and run:

```bash
npm install
```

### Run the Game (Development)

Start the development server:

```bash
npm run dev
```

This will launch Vite and open the game in your default browser. If it doesn't open automatically, visit:

```
http://localhost:5173
```

### Build for Production

To build the game for production:

```bash
npm run build
```

The output will be in the `dist/` folder.

## File Structure
- `src/` — Game source code (TypeScript)
- `public/` — Static assets (sprites, audio, etc.)
- `index.html` — Main HTML file
- `package.json` — Project metadata and scripts

## Notes
- All assets must be placed in the correct folders as referenced in the code (see `public/sprites/fx/dust/` for dust cloud PNGs).
- If you encounter issues, check the browser console for errors.

## Controls
- Arrow keys or WASD: Move
- Space: Jump / Double Jump

---

Enjoy platforming!
