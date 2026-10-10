# Run guide and verification — October 10, 2026

Run **`chess`** from a terminal. A dedicated mouse-enabled Ghostty window opens without editing global settings. Choose **Two players** or **Practice bot**, a time control, then **Start local game**.

- Left-click piece, then destination; promotion opens clickable choices.
- Right-drag: arrow. Right-click: circle. Repeat to toggle off.
- **Mark**: left-drag arrows / left-click circles as a right-click fallback.
- **Clear**, **Flip**, **Help**, **Actions**, **Menu**, **Exit** are clickable.
- Local draw/resign actions show confirmations. Online draw/resign goes through the owned-game guard; exiting or returning to menu does not resign.
- **Help → Theme details** shows the palette source.
- Ctrl+C is an optional emergency exit and restores terminal state.

The installed launcher is `~/.local/bin/chess` → this checkout's `bin/chess.mjs`. To remove only the installed command, remove that symlink; the checkout remains intact. `npm run install:local` refuses to overwrite another command.

Noctalia v5.2.1 uses `wallpaper m3-tonal-spot` here. The client reads `~/.cache/noctalia/reaper-palette.json`, checks its semantic roles and compares key colors with the generated Ghostty theme when available. It polls every 1.5 seconds, allowing atomic file replacement; transient invalid writes retain the last valid palette. It uses a contrast-corrected bundled fallback at initial failure. `CHESS_PALETTE=/path/to/palette.json` selects another semantic palette. The app changes no Noctalia settings, palette templates, terminal fonts, opacity, or wallpaper.

## Evidence

**Implemented:** mouse-controlled menu/board/overlays, local rules, clocks, promotion, castling/en passant, game results, offline practice bot, annotations, resize handling, palette refresh/fallback, token-protected bridge, original extension/options, guarded website game creation/moves/actions, local command installation.

**Runtime verified:** launched the installed app in Ghostty 1.3.1; menu and local board drawn from the current palette; Wayland virtual-pointer clicks started a five-minute game, played e4 and e5, selected a knight, and drew a right-drag arrow. Actual window screenshots appear below. This is desktop input/runtime evidence, not a claim that Nathan personally tested hardware mouse gestures.

**Automated:** 22 meaningful tests passed at this stage, including headless Chromium running the real unpacked extension and exercising page → content → worker → authenticated WebSocket → terminal controller boundaries. Fixture matchmaking selects five minutes and clicks Play once only when the rated setting matches. A separate PTY integration check mouse-started a local game and confirmed clean exit restored termios and mouse/alternate-screen modes. Syntax/extension-asset checks pass; dependency audit reports no known vulnerabilities.

**Read-only website inspection:** reached the logged-out Chess.com online play page, expanded its time-control menu, and observed the current preset buttons and Rated checkbox. Start Game was never clicked. These observations informed selectors; they do not verify login or matchmaking.

**Not verified:** authenticated Chess.com account/game lifecycle, current real website selectors, background-tab behavior on a real match, website permission/compatibility for a live session, physical-user acceptance, and 256-color visual appearance. No rated games or messages were used as tests. Login and reviewed extension loading in Nathan's chosen browser remain setup steps.

Only one online bridge can bind the local port at a time; additional client windows still support local play and show the port error.

The client requires a terminal with mouse reporting. It cannot override a terminal that suppresses mouse events; normal Ghostty launch supplies a reversible per-process option. Other terminal/multiplexer behavior is not established by the Ghostty test. The renderer uses ANSI/Unicode text, not Kitty graphics; the earlier PNG concepts remain only design references.

## Screenshots

![Actual running menu](runtime/01-menu.png)
![Actual initial local board](runtime/02-board.png)
![Actual selected pawn](runtime/03-selection.png)
![Actual moves, selection and user annotation](runtime/04-annotations.png)

## Browser setup

Follow README's five steps or run `chess --setup` for the extension path and pairing-file location. The pairing token is stored with mode 0600 in `~/.local/state/terminal-chess/bridge.json`; do not commit or share it. Click Copy token to avoid manual coordinate/text commands in the main UI. Chrome extension options accept pasted pairing text as a one-time setup field.

The browser adapter supports narrowly identified controls and the site's observed `board.game` shape. Missing controls produce a visible error. Unknown rated/unrated state prevents terminal game creation; a paired transport alone does not mean live games are supported. A user can create a game manually in the browser and attach if ownership and board state are observed. Do not blindly retry after an uncertain action.
