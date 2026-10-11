# Chess.com access request — submitted 2026-10-10

**The application was submitted successfully.** The browser confirmation was “Your response has been recorded”. The previous version of this file was a preparation draft; its contact placeholders were not submitted. No live access approval has been received.

## Submitted fields — sanitized public summary

| Form field | Actual submitted response |
|---|---|
| Name, email, Chess.com username | Nathan's supplied values were entered and checked in the form. Personal contact/account details are omitted from this public document. |
| Application name | Chess TUI |
| Project demonstration link | https://github.com/natersalad/chess-tui/releases/tag/offline-demo-v1 |
| Connected Board request | Yes — requesting software-terminal eligibility. |
| Interactive embedded WebView | No — not implemented. |
| WebSocket server capability | Yes — local capability fixture-tested; production live transport disabled pending approval. |
| Optional logo, Terms of Service and Privacy Policy URLs | Blank. Nathan explicitly confirmed the stated default terms/privacy condition before submission. |

The first-page required fields were verified present and valid before advancing. The capability selections were revalidated before a single Submit click. The recorded-response confirmation was then observed and captured. This is a summary of verified browser actions, not a Google-generated response export. A detailed private receipt is held locally outside Git; do not publish it.

## Submitted project description

I am building Chess TUI, a non-commercial personal Linux desktop client with an original graphical terminal board, mouse-selected human moves, clocks and local annotations. I request confirmation that a software-only terminal board is eligible for Connected Board access through your supported protocol. Local WebSocket server capability is fixture-tested; production live-play transport is disabled pending approval. The current build has no interactive embedded WebView. I can add a companion WebView if required; please confirm whether an external browser is an acceptable alternative.

The required product UX is automatic management of an app-owned companion browser process with a dedicated persistent profile. The terminal is the sole normal gameplay interface, and the companion window remains hidden during ordinary play. It appears for login, consent, required setup, recovery or an explicit Open browser action. The companion only transports authenticated game/client state and relays human-selected moves; it makes no chess decisions, analysis or move suggestions. Please explicitly confirm compatibility of hidden normal-play mode with the interactive WebView requirement. Continuous required browser visibility would conflict with this product direction. This is not a request for headless automation or bypassing login/consent. The companion is separate from the normal browser and must not implicitly resign on terminal exit; please provide lifecycle/reconnection requirements.

There is no engine analysis, move recommendation or automatic online gameplay. Offline practice is separate. Account consent, matchmaking and game actions remain deliberate and use only documented protocols and granted permissions. Please provide SDK/protocol documentation, registration prerequisites, supported native authentication, allowed game types and a test procedure.

The repository is public with the owner's approval. The linked release contains an approved 37.5-second silent recording of actual offline gameplay, with no claim of working Chess.com integration. I am not requesting access using another board's credentials. Please advise on additional review requirements before live implementation.

## Current status

Await Chess.com's eligibility/access review, especially permission for a hidden companion during ordinary terminal play. Submission is not approval, OAuth credentials or working live integration. Do not resubmit this completed request merely because an older preparation draft had placeholders.
