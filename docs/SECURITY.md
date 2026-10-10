# Bridge boundaries

The server binds only `127.0.0.1:17391`, requires a random 256-bit pairing secret, rejects unexpected browser origins, limits payloads to 16 KiB, and validates snapshots. The original extension has storage permission, a Chess.com host scope, and the local loopback host scope. It neither downloads scripts nor accepts arbitrary code to execute.

Account cookies, credentials, and profiles stay in the browser. No remote analytics or relay is used. Scratch work, local profiles, secrets, logs, dependencies and build directories are ignored by Git. The repository is private; privacy still requires keeping the token out of screenshots and commits.

Commands are allowlisted. One request is in flight at a time; request IDs are deduplicated on the page. Moves require a legal local move, an owned active game, the user's turn, and matching browser game identity/revision. Acknowledgement of a move requires a subsequent position change. Disconnect/stale state disables submissions. Timed-out commands are not replayed on reconnect. A timeout can still mean the action happened: reconcile in the browser before retrying.

Game creation refuses an already active game, missing login, ambiguous preset/Play buttons, and unknown or changed rated status. Resign/draw requires deliberate terminal confirmation. Menu/exit never implicitly resigns or cancels search. Website integration remains unofficial and unverified against an authenticated account; review current official integration requirements before live use.

The terminal imports an offline practice routine, but runs it only in local bot mode. No engine process, evaluation, move recommendation or automated move is exposed through the online bridge. User annotations are independent of bot output. Automated browser tests intercept all Chess.com requests with fixtures and start no actual games.

Reference architecture: a7mddra/chess-tui, MIT license reviewed. No upstream code is vendored or copied. Standard API/selector observations informed this original adapter; selectors and private page interfaces may change.
