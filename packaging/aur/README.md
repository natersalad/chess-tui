# AUR preparation — not published

`chess-tui-git` follows the upstream main branch; x86_64 is the built/tested architecture. The application code and original artwork are MIT; bundled wooden recordings retain CC0 attribution. Third-party npm dependency licenses remain unchanged. Local Chess.com downloads, credentials, scratch data, browser profiles, reference images, GIF/video documentation and browser test dependencies are excluded from the package.

Build in a scratch directory with `makepkg`; do not run the local installer from a package build. npm uses a build-local cache and the locked production dependency set. The package installs under `/usr/lib/chess-tui`, with `/usr/bin/chess-tui` and `/usr/bin/chess`. It does not change Ghostty/Noctalia settings or overwrite `~/.local/bin/chess`; an existing local launcher may still take precedence in PATH. Normal launch stays in the current terminal. Graphics require a compatible Kitty-graphics terminal; Ghostty is the tested option. Optional `libpulse` provides sound playback and `xdg-utils` opens help links.

Verification: makepkg build succeeded, syntax checks and 44 runtime/core/graphics/sound tests passed, extracted help/doctor commands worked, and extracted sharp rendered a PNG. No system package install was performed. AUR name lookup returned no existing chess-tui/chess-tui-git packages. AUR SSH host fingerprint matched the official published Ed25519 fingerprint; authentication returned Permission denied (publickey).

Before AUR publication: choose an authorized public maintainer email for the PKGBUILD comment, and register/configure an SSH key in the intended AUR account. The contact email supplied for the Chess.com form is not reused. An AUR repository accepts packaging sources, not the built binary. Regenerate `.SRCINFO` after edits, then push a separate AUR packaging repository on `master`.

Official references: https://wiki.archlinux.org/title/AUR_submission_guidelines and https://wiki.archlinux.org/title/Node.js_package_guidelines (redirects to the Arch developer manual).
