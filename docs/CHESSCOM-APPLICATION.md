# Chess.com access request — review draft, not submitted

Form: https://docs.google.com/forms/d/e/1FAIpQLSds2AeKLj9xqgu96Pu-rEAS0ItyqDbZbSgUFer0Mo6qMRx4Jg/viewform

## Field packet

| Form field | Proposed response / status |
|---|---|
| Name | Nathan must provide the submission name. |
| Email | Nathan must choose a contact email. No address is inferred. |
| Chess.com account | Nathan must confirm the username. |
| Application name | Terminal Chess |
| Description | Copy the draft below after review. |
| Project demonstration link | Required HTTPS/HTTP link. Not created or published. Share only an approved redacted demo; do not disclose or change visibility of the private repository. |
| Optional logo | Leave blank. |
| Optional terms/privacy links | Leave blank only if Nathan accepts the form's stated default terms/privacy consequence. No URLs are invented. |
| Connected Board request | Yes, as a request for software-board eligibility, explicitly described below. |
| Interactive embedded WebView | **No in the current build.** An external browser exists; it is not an embedded WebView. If the companion is implemented before submission, update this answer only after verifying it works. Do not mark Yes for a plan. |
| WebSocket server capability | Yes. A loopback Node/WebSocket server is fixture-tested, but not yet an approved protocol implementation. |
| OAuth-only branch redirects | Not a substitute for live-play access. If Chess.com routes us to this branch, request its supported native flow first; provide only an exact implemented/registered redirect, never a wildcard or speculative URI. |

The WebView question and WebSocket question are on the Connected Board branch. The OAuth-only branch has a required exact redirect field. The public form page supplies these branch fields without submitting or visiting an authenticated account.

## Description to review

I am building Terminal Chess, a non-commercial personal Linux desktop chess client. It has an original graphical board inside a terminal and lets a person deliberately select moves with the mouse, view position/clocks, and add local annotations. I would like to connect this alternate input/display surface to my own Chess.com games using your supported integration rather than undocumented page methods.

I am requesting confirmation that a software-only board client is eligible for Connected Board access. The current build has a local WebSocket server, but does not yet contain an interactive embedded browser. I can add an interactive companion WebView if your supported arrangement requires it. Please confirm whether this architecture is eligible and whether a normal external browser is an acceptable alternative.

My preferred UX is for launching the terminal app to start an app-owned companion process with a dedicated persistent browser profile. The terminal would normally stay foreground. The companion window would appear for login, consent, required setup or an explicit Open browser action, and otherwise remain minimized or hidden only if your requirements permit it. Please confirm whether that operating mode satisfies the interactive WebView requirement or whether the window must remain visible. I am not asking to substitute headless automation for an interactive WebView, or to bypass login/consent. The companion would be separate from the user's normal browser and would not implicitly resign a game on terminal exit. Please provide lifecycle/reconnection requirements as well.

There is no engine analysis, move recommendation, or automatic game-play in online mode. The local practice opponent is separate from online play. Account consent, matchmaking and other game actions would remain deliberate, and the implementation would use only your documented protocol and granted permissions. I would appreciate the relevant SDK/protocol documentation, registration prerequisites, supported native authentication flow, allowed game types, and a recommended test procedure.

The code repository remains private. A redacted visual demo can be provided with the project owner's approval; I am not requesting access using someone else's board credentials. The demo will use original piece artwork and custom colors, with no third-party audio. Please advise on any additional review or compliance requirements before live implementation.

## Demonstration prepared for approval

A local `demo.html` and board screenshot accompany the exported packet. They show the offline terminal prototype and plainly state that Chess.com access is not approved and a companion is not implemented. They contain no pairing token, browser/account details, private repository URL, or downloaded sounds.

This is ready to review, not ready to submit blindly: contact identity, an approved shareable demo URL, and the WebView/access choice remain required. Do not email Chess.com or Chessconnect, publish a demo, invite repository access, or submit the form without Nathan's direct approval.

This UX clarification authorizes documentation only. It does not authorize submission, demo publication, browser implementation, account login or game actions. The companion is proposed and its minimized/background compatibility is unconfirmed.
