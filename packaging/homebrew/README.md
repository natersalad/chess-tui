# Homebrew formula — initial test candidate

The existing public repository can serve as a custom tap through its `Formula/chess-tui.rb`; no separate tap repository or homebrew-core submission is needed. This is not a Homebrew core listing or a prebuilt bottle.

## Install and test on macOS

With an existing current Homebrew installation, run:

```sh
brew update
brew tap --custom-remote natersalad/chess-tui https://github.com/natersalad/chess-tui.git
brew install --build-from-source natersalad/chess-tui/chess-tui
brew test natersalad/chess-tui/chess-tui
```

If Homebrew asks about trusting an external formula, review `Formula/chess-tui.rb` before accepting. The formula installs the `chess-tui` command, not `chess`, so an existing local launcher stays intact. It does not invoke the local installer or change desktop configuration.

Open Ghostty, use at least 72 columns × 36 rows with mouse reporting enabled, then:

```sh
chess-tui --doctor
chess-tui
```

Choose Two players or Practice bot. Verify that the graphical board and clocks appear, click a legal move, hold/drag/release another piece, right-click during a hold to cancel, draw an arrow, and exit back to the same shell. Resize once and check the board remains square. Do not start online games: the access request is still pending.

Known macOS limits: sounds call Linux's `paplay`, so macOS sound playback is not implemented; setup/help opening uses `xdg-open`, so use the printed `--setup` link manually; `--window` has Linux-specific Ghostty options and should not be used on macOS. Noctalia is optional: absent palette files use the bundled fallback. The Linux button-event fallback is disabled on macOS; terminal mouse events must be verified on the Mac. `--text` is an explicit basic renderer, not evidence that graphics work.

For a failure, share the failing command and error, `brew --version`, `node --version`, and `chess-tui --doctor`. A build transcript can be captured locally with `brew install --verbose --build-from-source natersalad/chess-tui/chess-tui > chess-tui-build.log 2>&1`; inspect it before sharing and remove private paths/account data. No credentials or browser cookies are needed.

## Source, dependencies and verification

The formula pins upstream revision `27415f5ee5349d4b4da4d44bbca9f61753f9d0d6`, matching package version 0.1.0, and checks the archive SHA-256. This is an immutable source snapshot; the only existing release tag is a demo, not a stable software release. A proper versioned release and platform CI are needed before proposing homebrew-core inclusion.

Node is the runtime dependency. The current Homebrew `fetch` phase downloads the lockfile's production npm dependencies into a build-local cache; `install` repeats `npm ci` offline with lifecycle scripts disabled. Runtime files and platform-appropriate sharp binaries are installed under libexec. No dev browser dependencies, source screenshots, GIF/MP4, work directory or locally downloaded Chess.com audio are installed. Original code/artwork use MIT and bundled recordings retain CC0 attribution; dependencies retain their own licenses. No bottles have been built.

Completed on Linux: source checksum, Ruby syntax, network fetch followed by locked offline dependency install, syntax checks, 44 focused runtime tests, staged `--help`/`--doctor`, and native sharp PNG rendering. No global install occurred. **Actual Homebrew install/test/audit and macOS gameplay are not verified** because Homebrew and a Mac are unavailable in this environment.

After installing, maintainers should also run:

```sh
brew audit --strict natersalad/chess-tui/chess-tui
```

Report actual results before calling the package verified on macOS. Future upstream versions require a new immutable source/checksum and repeated platform tests; do not silently replace the source with a moving branch. A separate conventional `natersalad/homebrew-tap` is optional later, with its creation and visibility reviewed first.

Official references:

- https://docs.brew.sh/Formula-Cookbook
- https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap
- https://docs.brew.sh/Acceptable-Formulae

## “Repository not found” during tapping

Homebrew's one-argument `brew tap natersalad/chess-tui` (and automatic tapping from an install command) looks for `natersalad/homebrew-chess-tui`, which does not exist. Keep the entire explicit-URL tap command on one line and run it successfully before `brew install`. `--custom-remote` also repairs an existing tap's remote:

```sh
brew tap --custom-remote natersalad/chess-tui https://github.com/natersalad/chess-tui.git
brew tap-info natersalad/chess-tui
brew install --build-from-source natersalad/chess-tui/chess-tui
```

The actual project remote, raw formula and pinned source archive were verified publicly reachable. If the explicit command still fails, report the exact failing command, the repository URL named by the error, and `brew --version`; do not share credentials. This diagnosis does not establish a successful Mac install.
