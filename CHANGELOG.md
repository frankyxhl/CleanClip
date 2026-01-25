# Changelog

## [0.17.2](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.17.1...cleanclip-v0.17.2) (2026-01-25)


### Bug Fixes

* correct download link tag format in landing page ([8405ff7](https://github.com/frankyxhl/CleanClip/commit/8405ff7e23705d7c63992c500d80cc847458a9a0))
* correct download link tag format in landing page ([3633b4a](https://github.com/frankyxhl/CleanClip/commit/3633b4a1af8eb329fe8f3b3709e8bfa9af3b5798))
* use non-module script for offscreen document ([5c6c817](https://github.com/frankyxhl/CleanClip/commit/5c6c817651262d7f75853292de9493e7688201fa))
* use non-module script with message passing for offscreen document ([0c55256](https://github.com/frankyxhl/CleanClip/commit/0c55256646b8e69bd44b6cd0915e1b99c482cb84))

## [0.17.1](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.17.0...cleanclip-v0.17.1) (2026-01-25)


### Bug Fixes

* offscreen document script not executing due to CSP ([7cf618c](https://github.com/frankyxhl/CleanClip/commit/7cf618cbcaa69357dd81949ef28099c2e63eb513))
* offscreen document script not executing due to CSP ([05928a3](https://github.com/frankyxhl/CleanClip/commit/05928a3123787b42cea87e38f0f02d4f923bdca2))

## [0.17.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.16.1...cleanclip-v0.17.0) (2026-01-25)


### Features

* **019:** add Notion clipboard encoder ([9b7770c](https://github.com/frankyxhl/CleanClip/commit/9b7770c8bf4883e5611dcac3590baebbcc58d28c))
* **019:** add Notion format toggle in settings ([d783793](https://github.com/frankyxhl/CleanClip/commit/d783793ad5d6518017d999b753ac6adfa79ec60a))
* **019:** complete Notion clipboard with multi-block support ([b3ab28f](https://github.com/frankyxhl/CleanClip/commit/b3ab28fafdca217acb6c4ff234eeab1904907d89))
* **019:** integrate Notion format into OCR flow ([0ebfa7a](https://github.com/frankyxhl/CleanClip/commit/0ebfa7aa96092c8ab3e998b9816efcaf58a964db))
* **019:** Notion LaTeX clipboard injection ([f59fec9](https://github.com/frankyxhl/CleanClip/commit/f59fec9858deed5af796331968a2aeed493b1ea3))
* **019:** support custom MIME types in clipboard ([661bd24](https://github.com/frankyxhl/CleanClip/commit/661bd24f9d3b9ca019b1b3ebc8fdceb7fb530837))

## [0.16.1](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.16.0...cleanclip-v0.16.1) (2026-01-22)


### Bug Fixes

* dynamically get content script path from manifest ([d8f2a58](https://github.com/frankyxhl/CleanClip/commit/d8f2a585e76350b33526e9bcff3265c92ad1ff05))
* dynamically get content script path from manifest ([f0e4527](https://github.com/frankyxhl/CleanClip/commit/f0e4527961df6912af8d5790b99bbbd478a072c9))

## [0.16.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.15.0...cleanclip-v0.16.0) (2026-01-22)


### Features

* add clipboard message handler to content script ([d9f4f24](https://github.com/frankyxhl/CleanClip/commit/d9f4f242f2874ceabcb8745b8f79bee8e6196333))
* content script clipboard with fallback and error notification ([7edaec7](https://github.com/frankyxhl/CleanClip/commit/7edaec7fa5f6e46baa639f3e8af3e0ee6b7ba507))
* fix clipboard auto-copy after OCR ([5af0ad2](https://github.com/frankyxhl/CleanClip/commit/5af0ad2cde7972ff80c66a3b783dd0422af4af8d))


### Bug Fixes

* check content script response before declaring clipboard success ([6219b1d](https://github.com/frankyxhl/CleanClip/commit/6219b1da0ee9d99b89ea321c7681b409483a49e8))

## [0.15.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.14.0...cleanclip-v0.15.0) (2026-01-20)


### Features

* add options parameter to buildPrompt ([187a954](https://github.com/frankyxhl/CleanClip/commit/187a9549cf661d31c408b4336f8ab468bed8701d))
* inject header/footer exclusion in prompt ([8db33d2](https://github.com/frankyxhl/CleanClip/commit/8db33d23bcc67b359e56bf6c97253b98109e73f6))
* pass text processing options to OCR pipeline ([ff2ab2d](https://github.com/frankyxhl/CleanClip/commit/ff2ab2d684638f46c29bc48217651c3349054f5c))
* prompt-based header/footer removal ([1e46797](https://github.com/frankyxhl/CleanClip/commit/1e46797a363a387ae043ced88327bceae7299645))

## [0.14.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.13.0...cleanclip-v0.14.0) (2026-01-20)


### Features

* add latex-notion-md option to UI ([c1d251d](https://github.com/frankyxhl/CleanClip/commit/c1d251ded22cf6a1b09ce1c9af87151ea00ade6d))
* add latex-notion-md output format type ([cdc7080](https://github.com/frankyxhl/CleanClip/commit/cdc708022015bebd2c251f6778a622fc45e82600))
* add structured format option to UI ([75d06cd](https://github.com/frankyxhl/CleanClip/commit/75d06cd4b0964d52bfccd5f91407743e64378b14))
* add structured output format type ([39b6a11](https://github.com/frankyxhl/CleanClip/commit/39b6a112c566c777f09d58512c7a835dddd226d0))
* image and text separation (Issue [#24](https://github.com/frankyxhl/CleanClip/issues/24)) ([6b945ac](https://github.com/frankyxhl/CleanClip/commit/6b945ac0e72c7c972126ac4c822d18650fd1c0c9))
* implement latex-notion-md prompt ([68c9615](https://github.com/frankyxhl/CleanClip/commit/68c961523d791ca190ce82f9762fa58e205fbc8c))
* implement structured prompt for image/text separation ([5313f82](https://github.com/frankyxhl/CleanClip/commit/5313f824b7fc48efac482f032366f8b9240f73c4))
* Notion LaTeX blocks support (Issue [#23](https://github.com/frankyxhl/CleanClip/issues/23)) ([b220603](https://github.com/frankyxhl/CleanClip/commit/b220603572c7ba1585a3c2916390e8ba76b87362))


### Bug Fixes

* skip CI tests for release-please PRs ([da8b16a](https://github.com/frankyxhl/CleanClip/commit/da8b16a0e28d6cb48e9ac6dadde2b0bd3973b923))
* skip CI tests for release-please PRs ([54639de](https://github.com/frankyxhl/CleanClip/commit/54639de4853e883f5447b4d469936714ccf46d49))
* use RELEASE_PAT for release-please to trigger CI ([51ebd97](https://github.com/frankyxhl/CleanClip/commit/51ebd979b0d382362c8145fda387f01153b05e98))
* use RELEASE_PAT for release-please to trigger CI ([3152bc8](https://github.com/frankyxhl/CleanClip/commit/3152bc8c15e28429101063b5d1dd5d887ab6ca12))

## [0.13.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.12.0...cleanclip-v0.13.0) (2026-01-19)


### Features

* add removeHeaderFooter to getTextProcessingOptions ([8620735](https://github.com/frankyxhl/CleanClip/commit/8620735c4da8a8dd5f066d0d959062efe19e5e24))
* add removeHeaderFooter to TextProcessingOptions ([3cb9b7c](https://github.com/frankyxhl/CleanClip/commit/3cb9b7ce63fd88a0525f783c922cecc37a112e00))
* add removeHeaderFooter toggle to Options UI ([c699722](https://github.com/frankyxhl/CleanClip/commit/c6997220bf1eea0c15020ba518e0c171366e2366))
* implement combined removeHeaderFooter function ([20e8b9d](https://github.com/frankyxhl/CleanClip/commit/20e8b9d3d8d34d19135306e51011dae59765f8e5))
* implement header removal (short lines, 3+ occurrences) ([083f4d9](https://github.com/frankyxhl/CleanClip/commit/083f4d93bb700f9765b535e882c7029b6812d1e9))
* implement page number removal ([a1ed1ba](https://github.com/frankyxhl/CleanClip/commit/a1ed1ba9a6391b0f1e397baa58964381576218a5))
* remove header and folio (Issue [#25](https://github.com/frankyxhl/CleanClip/issues/25)) ([ae0ef6a](https://github.com/frankyxhl/CleanClip/commit/ae0ef6a4bb82b36da1771e99f002531999467bbe))


### Bug Fixes

* correct curly quotes regex and improve test coverage ([5d60b47](https://github.com/frankyxhl/CleanClip/commit/5d60b4791593cd95256c5da9b9a9000c7f554b10))

## [0.12.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.11.0...cleanclip-v0.12.0) (2026-01-17)


### Features

* add LaTeX format options to settings UI ([a36c4cd](https://github.com/frankyxhl/CleanClip/commit/a36c4cd02a8652ea224209b1bef243eff1d0158e))
* add LaTeX math OCR output formats for Notion and Obsidian ([8eaa84f](https://github.com/frankyxhl/CleanClip/commit/8eaa84fd2d387969df1cf895ee19016a1979fcad))
* add latex-notion and latex-obsidian output formats ([da41e53](https://github.com/frankyxhl/CleanClip/commit/da41e53666a9b77c9e7e0159e11eb07250700139))
* implement LaTeX prompt generation for Notion and Obsidian ([c620adb](https://github.com/frankyxhl/CleanClip/commit/c620adba4ed21846d5c973eed0b27fbc5cee5f60))


### Bug Fixes

* add issues:write permission for release-please comments ([#16](https://github.com/frankyxhl/CleanClip/issues/16)) ([46778ee](https://github.com/frankyxhl/CleanClip/commit/46778eefd45aeba14f30dc45e6ea961dc1d5b686))
* apply text processing for markdown format ([1b58567](https://github.com/frankyxhl/CleanClip/commit/1b5856783bc1cdd9fd60a1153dad3c31034fa701))
* read outputFormat from storage instead of hardcoded value ([a1e3861](https://github.com/frankyxhl/CleanClip/commit/a1e38618c20af34d47046d095ceaa7f204c36018))
* skip text processing for LaTeX; add tikzcd fallback warning ([3d63eaa](https://github.com/frankyxhl/CleanClip/commit/3d63eaa546397320b32224d98de1354b748e44ac))

## [0.11.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.10.0...cleanclip-v0.11.0) (2026-01-15)


### Features

* add shortcut display to options page ([#12](https://github.com/frankyxhl/CleanClip/issues/12)) ([#13](https://github.com/frankyxhl/CleanClip/issues/13)) ([015043f](https://github.com/frankyxhl/CleanClip/commit/015043fab7b780360350b664584f4c8bff425144))


### Bug Fixes

* use GH_TOKEN for release-please to trigger CI ([#15](https://github.com/frankyxhl/CleanClip/issues/15)) ([ab81a6e](https://github.com/frankyxhl/CleanClip/commit/ab81a6e424b2a308b35299a3222d4530787ace20))

## [0.10.0](https://github.com/frankyxhl/CleanClip/compare/cleanclip-v0.9.2...cleanclip-v0.10.0) (2026-01-14)


### Features

* add copy button functionality with notification ([eb3bd20](https://github.com/frankyxhl/CleanClip/commit/eb3bd2062a40241260c17808c3eede3bc59f808a))
* add GitHub Pages deployment ([#2](https://github.com/frankyxhl/CleanClip/issues/2)) ([de3d01f](https://github.com/frankyxhl/CleanClip/commit/de3d01fd6891a37e652496f2ef39121adfcfce61))
* add history navigation sidebar with current item highlight ([d6f0f47](https://github.com/frankyxhl/CleanClip/commit/d6f0f4749b20965563971bcea350160c86d6191b))
* add landing page for early preview distribution ([b95d38a](https://github.com/frankyxhl/CleanClip/commit/b95d38a0efa1da3cbbace51f76352c5f9f6e5305))
* add Manifest V3 config (Green phase) ([c92e4eb](https://github.com/frankyxhl/CleanClip/commit/c92e4eba80830b7ffba87048d751b21d1b542149))
* add OCR completion notification ([69f3d00](https://github.com/frankyxhl/CleanClip/commit/69f3d00ee34af96d5a5729e5c9dba8108bf6ffb7))
* add screenshot success notification ([97626b6](https://github.com/frankyxhl/CleanClip/commit/97626b6f8d81eca0bd1095562a00923958e6bac4))
* configure Vite + CRXJS + TypeScript (Green phase) ([d4e2f51](https://github.com/frankyxhl/CleanClip/commit/d4e2f5163f0a050c28aef5ed32880f40abfed58b))
* implement Options page UI (Green phase) ([c8d2138](https://github.com/frankyxhl/CleanClip/commit/c8d2138f886890ad0a0ffa68f6c3a07a794ae13e))
* improve markdown parser with lists, links, blockquotes (XSS safe) ([b8b3af9](https://github.com/frankyxhl/CleanClip/commit/b8b3af9513064736b9f1264fd94e6292baefef15))
* read text processing settings in OCR pipeline ([047e7e1](https://github.com/frankyxhl/CleanClip/commit/047e7e12de9a7d32536de0221fb3d49cbc9fca23))
* replace app icons with new design ([df278b7](https://github.com/frankyxhl/CleanClip/commit/df278b78707d856a6ab09904b18d3843cee8ab2e))
* upgrade to Gemini 3 Flash API ([97137c8](https://github.com/frankyxhl/CleanClip/commit/97137c83b6d93017727b9934621ce79819316d88))


### Bug Fixes

* add notification debugging and error handling ([642e395](https://github.com/frankyxhl/CleanClip/commit/642e395f2c52d30347eec9c4e1634626908485e9))
* auto-inject content script when not loaded ([18130b1](https://github.com/frankyxhl/CleanClip/commit/18130b12221896a717a62275473b12f0ee64f4e9))
* build errors and add detail/debug pages to vite config ([eab0bd9](https://github.com/frankyxhl/CleanClip/commit/eab0bd9b4a06992b1a77997759dbfde4f380b574))
* correct 003-ux-improvements proposal consistency ([f0fcb41](https://github.com/frankyxhl/CleanClip/commit/f0fcb41cc29622d5ba09ca4cf679d5fe3a287e0f))
* correct icon path in README to match GitHub Pages deployment ([#3](https://github.com/frankyxhl/CleanClip/issues/3)) ([0c723b5](https://github.com/frankyxhl/CleanClip/commit/0c723b54d590d491da0950deff985c5b5bbf04f3))
* correct mock setup in offscreen tests ([188302b](https://github.com/frankyxhl/CleanClip/commit/188302bd238777b7338faf031b87be0d31cabb28))
* handle content script not loaded error gracefully ([d7c81d6](https://github.com/frankyxhl/CleanClip/commit/d7c81d61b2ebe8b7f95575f4e6f863ebb63726b0))
* handle missing global.navigator in CI environment ([b86a63e](https://github.com/frankyxhl/CleanClip/commit/b86a63e9735b92b734961c95529184eaa0304d54))
* rebuild after tests in release workflow ([56dbba7](https://github.com/frankyxhl/CleanClip/commit/56dbba718f7929c28959361231df2e0fc13e46ab))
* rebuild after tests in release workflow ([a4f4d0b](https://github.com/frankyxhl/CleanClip/commit/a4f4d0b29f0d856cd41e8335564a10fa251fa31d))
* remove dangling CSS reference and stderr noise ([f55d6cf](https://github.com/frankyxhl/CleanClip/commit/f55d6cf55b60fde911d790ac393462c139e897c8))
* set proper popup height to prevent content clipping ([a3d8597](https://github.com/frankyxhl/CleanClip/commit/a3d859716371d68f5d86dfd47ab1799e4cf1cd4f))
* sync semantic-release version to package.json and manifest.json ([#6](https://github.com/frankyxhl/CleanClip/issues/6)) ([e9fc690](https://github.com/frankyxhl/CleanClip/commit/e9fc690951eb25bd2e21689c708a6937cc1bbc61))
* trigger CI on release-please branches ([#10](https://github.com/frankyxhl/CleanClip/issues/10)) ([f83bd59](https://github.com/frankyxhl/CleanClip/commit/f83bd59761a7bafac6728941e7881da5a6d7fcdc))
* update manifest.json version to 0.5.0 ([44da0ee](https://github.com/frankyxhl/CleanClip/commit/44da0ee19da462054f3b3b15ae735a9fe6e7aa81))
* use document.execCommand for clipboard in offscreen ([442e229](https://github.com/frankyxhl/CleanClip/commit/442e2291f6949f2ecd3b8b2c8f581068f34b5c4d))
* use GH_TOKEN for semantic-release to bypass branch protection ([#7](https://github.com/frankyxhl/CleanClip/issues/7)) ([df1ca89](https://github.com/frankyxhl/CleanClip/commit/df1ca8983cc5b0b79d3c0a472c9e8169dd1814b4))
* use Node.js 22 for semantic-release compatibility ([eae5cb1](https://github.com/frankyxhl/CleanClip/commit/eae5cb10173b1d17634dbcbe180ff0b0c98087ff))
* use storage polling for clipboard operations ([4554a5e](https://github.com/frankyxhl/CleanClip/commit/4554a5e970bc97ed1aba38d6bc201c607f149690))
* use vitest run to exit after tests complete ([d59a85d](https://github.com/frankyxhl/CleanClip/commit/d59a85dac3618dfa4a43d080711d201f13d9b4ee))
* wait for DOM ready in offscreen clipboard document ([a39bbe1](https://github.com/frankyxhl/CleanClip/commit/a39bbe17e3b3e171745bfafb89ba8a3633e05477))
