# Terminal Chess

Nathan's private project for a mouse-driven terminal client connected to Chess.com.

**Status:** design brief only. No executable client, browser bridge, or Chess.com integration has been implemented or verified. The future command is `chess`.

## Intended experience

1. Type `chess` in a terminal.
2. Choose a time control from a compact menu: five-minute games plus other modes (initial candidates: 1, 3, 10, and 15+10 minutes; confirm availability through the connected session).
3. Select a game and enter a focused board view. Hide the menu during play; retain only essential clocks/status alongside the board.
4. Click a piece, then its destination square to move. Highlight the selected square, available destinations, and the previous move. Handle promotion through a small mouse-selectable chooser.
5. Mark squares and draw annotation arrows with mouse gestures, with a simple way to clear them. Coordinate entry is not required for normal play.

## Intended architecture

- **Original terminal board:** own rendering, square hit-testing, selection, highlights, and annotation overlay. Prototype mouse input and rendering in Nathan's terminal before choosing a framework. Arrows may need a terminal graphics protocol; test the actual terminal's capabilities and resize behavior.
- **Session/controller:** manage the time-control menu, matchmaking state, current game, board orientation, clocks, promotion, and reconnect behavior.
- **Background browser bridge, if needed:** an authenticated Chess.com browser session remains responsible for website interaction. A companion extension or browser adapter exchanges board/session state and explicit user actions with a local bridge. Keep authentication in the browser; do not commit credentials or browser profiles.
- **Local transport:** consider a loopback-only authenticated channel between the terminal and browser adapter. Treat website state as authoritative; reconcile after reconnect and prevent duplicate move submissions.

This is a proposed architecture. A terminal does not directly host Chess.com's webpage. Game selection, state extraction, move submission, background operation, website compatibility, and supported integration constraints all need investigation and runtime verification.

## Reference and direction

[a7mddra/chess-tui](https://github.com/a7mddra/chess-tui) documents a Chrome extension / WebSocket / terminal UI approach. Use it as an architectural reference, while building an original board centered on richer mouse interaction and terminal-side game selection. No upstream code has been copied into this repository.

## First implementation milestones

1. Prove a local board with click-to-move, highlights, promotion, arrows, and resize handling in the target terminal.
2. Define a small bridge protocol and exercise it with fixture game states.
3. Investigate and verify the browser connection and available time controls.
4. Verify one complete user-driven game lifecycle: menu, matchmaking, moves, clocks, result, and reconnect.

Keep this repository private. This initialization deliberately contains no app implementation or dependency selection.
