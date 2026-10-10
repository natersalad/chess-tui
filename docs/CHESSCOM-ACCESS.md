# Supported Chess.com connection — 2026-10-10

## Decision and evidence

Request written approval for a software-only board client, then implement the protocol Chess.com supplies. The terminal is an alternate input/display surface for deliberate human moves. No supported live connection is established today.

- [Official PubAPI guide](https://support.chess.com/en/articles/9650547-what-is-the-pubapi-and-how-do-i-use-it): public data is read-only; it cannot submit moves. The same guide provides the access-request route and limits undocumented workarounds.
- [Official request form](https://docs.google.com/forms/d/e/1FAIpQLSds2AeKLj9xqgu96Pu-rEAS0ItyqDbZbSgUFer0Mo6qMRx4Jg/viewform): the Connected Board branch requires an interactive embedded browser (WebView) and a WebSocket server. All branch fields were read from the form's publicly delivered page data; nothing was filled or submitted.
- [Official developer club](https://www.chess.com/clubs/about/chess-com-developer-community) links the same request route and an OAuth document. The OAuth document could not be retrieved in this check; OAuth scopes, native-client authentication, redirects and live-play permissions remain unconfirmed. OAuth login approval alone must not be treated as permission to submit moves.
- [Chessconnect](https://chessconnect.de/) describes its own approved electronic-board integration. This establishes a hardware integration precedent, not reusable credentials, an SDK license, or approval for this terminal app. No published terminal adapter/SDK contract was identified in the reviewed sources.

**Eligibility remains a question for Chess.com.** The form does not establish that a pure terminal UI qualifies. A companion interactive WebView may satisfy the stated technical prerequisite, but does not itself grant access. A normal browser tab is not assumed equivalent to an embedded WebView.

## Current code

`src/connection.mjs` supplies the production pending-approval provider. It creates no browser transport and refuses live requests. `bin/chess.mjs` no longer starts the legacy WebSocket bridge. Browser setup offers the official request form and API help, with no token-pairing instructions. Offline gameplay/rendering remain unchanged.

`src/bridge.mjs` and `extension/` retain the original fixture-only research implementation. They are not the supported route and are not invoked by the production launcher. Do not load the old extension for live play. If a copy is already loaded, disable it in the browser; editing this repository does not unload an installed extension or change a currently running process. Restart chess for the new production behavior.

No credentials or browser profile were searched for or extracted. No account authorization, game creation, matchmaking, move, resignation, draw offer, or external message was sent during this work.

## Integration design after approval

```text
human click/drag
    ↓
terminal App: board display, selection, annotations and legal-input validation
    ↓
approved connection provider: account/game identity, sequence, stale-state guard
    ↔ documented local Connected Board WebSocket protocol
    ↔ interactive companion WebView + Chess.com-approved SDK/client contract
    ↔ Chess.com authenticated game
```

The companion shows an interactive window for login, consent, required setup, recovery or an explicit Open browser request. During ordinary play it must remain hidden: the terminal is the sole normal gameplay interface. Its role is authenticated game/client-state transport and relaying human-selected moves; it makes no chess decisions, analysis or move suggestions. This operating mode requires explicit compatibility approval from Chess.com. It must not reach into `game.getFEN`, `getLegalMoves`, `move`, cookies, private tokens or undocumented service endpoints. The exact companion stack and messages depend on the supplied integration instructions; no Electron dependency or speculative API implementation is introduced before that contract exists.

### Required companion UX — design only

Nathan's required future launch is `chess`: the terminal stays foreground while the application automatically starts or reconnects its own companion browser process. **A running browser process and a visible browser window are different things.** The process must retain its authenticated page/session with its window hidden during ordinary terminal play. Compatibility is unconfirmed; if Chess.com requires continuous browser visibility, that conflicts with this product requirement and must be reported as a blocker, not delivered as an equivalent design. This is not a claim that a headless browser satisfies the required interactive WebView.

The companion uses a persistent, dedicated application profile for Nathan's own login. It never reuses, reads or modifies his regular browser profile. Login, account choice, consent, site-required setup and any security challenge show a real interactive window. An explicit **Open browser** action makes that same companion visible. After the necessary interaction it returns to hidden normal-play mode, subject to explicit approval of that mode; no silent login, consent or hidden matchmaking is proposed.

An extension is not assumed necessary. The supplied SDK/protocol may replace the experimental extension entirely. Process ownership should use an app-specific instance/session identity, so cleanup cannot close Nathan's normal browser or unrelated pages. No browser infrastructure is implemented by this documentation change.

Closing policy: when no live game is active, an orderly terminal exit stops the owned companion and connection while preserving its profile. During a live game, make the consequence explicit and let Nathan keep the companion visible or deliberately disconnect the app; disconnecting does not resign and may leave the server-side game and clocks running. A crash or terminal termination must not submit resignation, draw or any substitute move. Reconnection must reconcile approved server state rather than replay requests. These policies and the exact companion lifetime still need the official protocol's lifecycle requirements.

Keep the existing App boundary (`snapshot`, `connected`, deliberate `command`, status updates), replacing the research transport with an approved provider. The provider will map documented events to owned game identity, turn, position, clocks, result and sequence. Submission must reconcile against authoritative state; an uncertain timeout is never replayed. Website account selection must not be guessed. Matchmaking, resign and draw remain separate deliberate actions only when permitted by the granted protocol. No bot, engine, evaluation or move suggestion may feed online play.

Authentication design: use the approved native/companion flow and minimal granted scopes; use PKCE/state validation if supported/required by Chess.com. Store issued tokens privately outside Git, handle revocation, and never invent a client secret for a public desktop app. Loopback origin restrictions and the official WebSocket handshake replace any speculative assumptions about the old bridge token.

## Required access answers

1. Is a non-commercial software board with terminal input/display eligible? Is an interactive companion WebView acceptable, and is an ordinary external browser an allowed alternative?
2. Which SDK/protocol and granted scopes permit human move submission, game-state/clock events and result updates? Which time controls/game types are allowed? Is rated play permitted?
3. What exact WebView requirements, WebSocket origin/handshake, local address/port/TLS rules and client registration apply?
4. Which native OAuth flow and exact redirects are supported? Does access require a confidential hosted service, or can it remain local-only?
5. May an app-owned, persistently authenticated interactive WebView remain hidden/minimized during ordinary terminal play and appear only for login, consent, required setup, recovery or an explicit Open browser action? Hidden normal play is a firm product requirement; continuous visibility would conflict with it. Please explicitly confirm compatibility with the published interactive WebView requirement, and what lifecycle/reconnect behavior is required when the terminal closes? This is a request for a permitted interactive companion mode, not headless automation.
6. Is a test account/sandbox/bot game available? What compliance review/demo requirements apply? Are custom piece assets and local sound choices acceptable under the granted arrangement?

These are questions, not inferred permissions. A private repository and locally downloaded Chess.com sounds must not be presented as licensed/approved integration assets. The approval demo uses original vector pieces, Noctalia colors, and no audio.

## Verification gates

- Before access: pending provider refuses every command without a connection; local tests remain green.
- After contract: test OAuth callbacks, origin/handshake, account binding, event ordering, stale/disconnected state, duplicate suppression and uncertain acknowledgements with documented fixtures.
- Then deliberate login/consent under Nathan's control. Use a specifically agreed test game or sandbox; do not start rated matchmaking to verify setup.
- Acceptance requires an observed owned game, one human-selected legal move acknowledged by Chess.com, an opponent reply reflected in the terminal, accurate clocks/results, and disconnect/reconnect without duplicate submission. Fixture tests and a connected indicator are insufficient.

See [the application packet](CHESSCOM-APPLICATION.md) for the reviewable request. No outreach is authorized until Nathan approves the exact content and disclosure choices.
