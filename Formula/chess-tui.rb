class ChessTui < Formula
  desc "Mouse-driven graphical terminal chess with offline play"
  homepage "https://github.com/natersalad/chess-tui"
  url "https://github.com/natersalad/chess-tui/archive/e137f292782ec4552e14371f7d25b5ed1c67bf26.tar.gz"
  version "0.1.0"
  revision 2
  sha256 "2b4484c98adeccb063cc2f1055d21c25f53d674c632e03898830c7e53dfa3b48"
  license all_of: ["MIT", "CC0-1.0"]

  depends_on "node"

  # Download locked production dependencies before the offline install phase.
  def fetch
    system "npm", "ci", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund",
           "--cache", buildpath/"npm-cache"
  end

  def install
    system "npm", "ci", "--offline", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund",
           "--cache", buildpath/"npm-cache"
    libexec.install "bin", "src", "assets", "node_modules", "package.json"
    rm_f libexec/"node_modules/.package-lock.json"
    (bin/"chess-tui").write <<~EOS
      #!/bin/sh
      exec "#{Formula["node"].opt_bin}/node" "#{libexec}/bin/chess.mjs" "$@"
    EOS
    chmod 0755, bin/"chess-tui"
    pkgshare.install "LICENSE"
    pkgshare.install libexec/"assets/ATTRIBUTION.md"
  end

  def caveats
    <<~EOS
      Run chess-tui in Ghostty with Kitty graphics, truecolor and mouse reporting.
      Minimum size: 72 columns by 36 rows. The current terminal is used.
      No existing chess launcher or desktop configuration is changed.
      macOS gameplay is unverified; avoid --window (Linux-specific options).
      Sounds need paplay on Linux; macOS sound playback is not implemented.
      Chess.com live access is not approved or connected; offline play is available.
    EOS
  end

  test do
    assert_match "mouse-driven terminal chess", shell_output("#{bin}/chess-tui --help")
    assert_match "Approval required", shell_output("#{bin}/chess-tui --doctor")
    (testpath/"render.mjs").write <<~EOS
      import {createRequire} from 'node:module';
      const require = createRequire('#{libexec}/package.json');
      const sharp = require('sharp');
      const png = await sharp({create:{width:16,height:16,channels:4,background:'#667744'}}).png().toBuffer();
      console.log(png.length > 0 ? 'PNG OK' : 'PNG failed');
    EOS
    assert_match "PNG OK", shell_output("#{Formula["node"].opt_bin}/node #{testpath}/render.mjs")
  end
end
