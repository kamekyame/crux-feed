# crux-feed

CrUX（Chrome UX Report）を RSS として購読できるようにするプロジェクトです

## Feed URL(RSS2)

CrUX Vis 互換となっています。

- URL: `https://crux-feed.kamekyame.deno.net/`
- queryParams
  - view: `cwvsummary`
  - url
  - identifier: `url`, `origin`
  - device: `ALL`, `PHONE`, `DESKTOP`, `TABLET`

Examples

- `https://crux-feed.kamekyame.deno.net/?view=cwvsummary&url=https://google.com/&identifier=url&device=ALL`
