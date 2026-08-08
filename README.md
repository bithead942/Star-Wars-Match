# Star Wars Match

A full-screen, touch-optimized memory card game for Windows 11, built with Electron.

## How to play

- All cards start face down.
- Tap two cards to turn them over.
- If the card faces match, the pair disappears.
- If they don't match, the cards flip back over.
- Clear all cards to win. Your score is the time plus the number of rounds.

## Settings

Tap the grey gear icon in the upper right corner.

- **Difficulty**:
  - Easy: 6 cards (3 pairs)
  - Medium: 10 cards (5 pairs)
  - Hard: 14 cards (7 pairs)
- **Theme**: Light (white background) or Dark (black background)
- **Reset Game**: restart and reshuffle immediately

Changing a setting and closing the settings window will reset the game. If no settings are changed, the current game resumes.

## Sounds

The game uses the Web Audio API to generate the card flip, match, and mismatch sounds. No external audio files are needed.

## Run on Windows 11

1. Install [Node.js](https://nodejs.org).
2. Open a terminal in this folder.
3. Run `npm install` to install Electron.
4. Run `npm start` to launch the game in full screen.

## License

MIT
