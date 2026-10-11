# Chess TUI

A working mouse-driven chess TUI for Nathan, with read-only Noctalia colors, local two-player play, a weak offline practice bot, and an experimental Chess.com browser bridge. Private project.

## Launch

```sh
cd /home/nathanw/Projects/terminal-chess
npm ci
npm run install:local
chess
```

`chess` is already installed at `~/.local/bin/chess` on this machine. Normal launch runs inside the terminal where you type it and returns to that shell when you exit. `chess --here` remains an alias for this default. The current terminal must permit mouse reporting; this machine’s Ghostty configuration now enables it, with Nathan’s approval. `chess --window` optionally opens a separate mouse-enabled Ghostty session without changing global settings. Node.js 22+ is required. Minimum size: 72 columns × 36 rows. Ghostty with truecolor is the tested target.

Click a mode, choose 1, 3, 5, 10, or 15+10, then start. Click a piece and destination. Right-drag and release draws an arrow; same-square right-click/release marks a square red. Normal left-click clears all annotations. There is no drag preview or in-game toolbar. The launch menu and promotion choices remain mouse-controlled. Keyboard shortcuts are optional; move coordinates are never required.

## Actual runtime

These are screenshots of the running application in Ghostty, captured through the compositor. The selection/annotation state followed real application mouse events generated through a Wayland virtual pointer, not a human hardware test. They are not design mockups.

![Running time-control menu](docs/runtime/01-menu.png)
![Running board after e4 e5, knight selection, and a user arrow](docs/runtime/04-annotations.png)

The primary board uses original, centered outlined vector pieces rasterized to PNG through Ghostty's Kitty graphics protocol. No ASCII or piece letters appear in this renderer. Coordinates sit inside the board edges; arrows are broad, translucent gold and square marks are translucent Noctalia-derived red. Normal terminal transparency surrounds the board. Clock-only text updates are sparse, and board changes use a completed inactive image buffer before swapping, rather than clearing the visible image. `chess --text` is an explicit basic fallback.

The optional `--window` launcher disables titlebar/tab chrome with per-process options and preserves global Ghostty/Noctalia configuration. See the run guide for actual stability samples and limits.

## Chess.com supported access

**Live play is not connected.** Production now uses an approval-required provider and does not start the undocumented page-method bridge. The public API cannot submit moves. Review [supported integration design](docs/CHESSCOM-ACCESS.md) and [application packet](docs/CHESSCOM-APPLICATION.md). The official request form requires an interactive WebView plus a WebSocket server for the connected-board route; this terminal has no embedded browser yet, and software-only eligibility is unconfirmed.

`chess --setup` prints the supported request route. The original extension and bridge remain fixture-only research files; do not use them as a supported live-play setup. Local play, original graphics, Noctalia colors, mouse controls and window dimensions remain unchanged. No engine advice is available online. No application, account consent or real game action has been submitted.

## Development

```sh
npm ci
npx playwright install chromium  # only needed for browser fixture tests
npm test
npm run check
```

Tests cover legal special moves, clocks/results, mouse routing, annotations/promotion, contrast/schema validation, bridge authentication/ownership/staleness, browser control guards, and the full extension transport. Browser fixture tests never contact Chess.com; requests are intercepted locally. `CHESS_TEST_BROWSER` can override the browser executable for tests.

Reference: [a7mddra/chess-tui](https://github.com/a7mddra/chess-tui) informed the browser-board architecture. The tracked client and extension are original code; no upstream implementation was copied. Its MIT license was reviewed before development.

Knight-move annotations use a right-angle bend: the two-square leg first, then the one-square leg, in either board orientation. Other arrows remain straight.

Hold the left mouse button on your piece and drag it across the board. Release to make a legal move. An invalid or off-board drop returns the piece to its original square and plays a short local error tone through `paplay`. Click-then-click movement still works. Promotion waits for your choice. Restart chess to load updates.

The pointer becomes an open hand over a movable piece and a closed hand while the left button holds it. Ghostty cursor shapes use [OSC 22](https://ghostty.org/docs/vt/osc/22); the app restores the terminal cursor on exit. Hovering alone never moves a piece.

Smooth dragging: the board stays cached during motion, and the held piece is uploaded once as a transparent sprite. Subsequent motion sends only a small placement update, using sub-cell pixel offsets. Pixel mouse reporting is enabled only after a supported-mode reply; other terminals keep the cell-coordinate fallback. This uses the [Kitty graphics placement protocol](https://sw.kovidgoyal.net/kitty/graphics-protocol/). No animation or interpolation is added. Automated checks verify 60 consecutive movements without re-uploading the board or sprite; perceived smoothness on Nathan’s desktop still needs a live check.

Right-click while holding a piece cancels the drag and restores its original square, without creating an annotation or making a move. Successful placements play a short local piece sound; invalid drops retain their separate error tone. Online placement sound waits for a confirmed board change rather than a submitted request.

Successful graphical moves use a quick 110 ms eased glide into the destination square, including click-to-move, drag placement and practice-bot moves. The held sprite stays cached during the glide; invalid drops and right-click cancellation remain immediate.

Chess uses slim explicit side margins and more vertical breathing room. It preserves your existing terminal dimensions and manual resizing. A square board in a wide window naturally leaves extra side space.
