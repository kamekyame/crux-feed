import RedirectCrUXVis from "#/islands/RedirectCrUXVis.tsx";
import { createCruxVisUrl } from "#/src/cruxvis.ts";
import { createFeedTitle, parseQueryParams } from "#/src/utils.ts";
import { define } from "#/utils.ts";

export default define.page((c) => {
  const reqUrl = new URL(c.req.url);
  const reqQueryParams = parseQueryParams(reqUrl.searchParams);
  const asof = reqUrl.searchParams.get("asof");

  const title = `${createFeedTitle(reqQueryParams)} as of ${asof}`;
  const ogImageUrl = `${reqUrl.origin}/i?${reqUrl.searchParams.toString()}`;
  const cruxVisUrl = createCruxVisUrl(reqQueryParams);

  return (
    <html>
      <head prefix="og: http://ogp.me/ns#">
        <title>{title}</title>
        <meta property="og:url" content={c.req.url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:site_name" content="CrUX Feed" />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="robots" content="noindex, noffollow" />
      </head>
      <body>
        <h1>{title}</h1>
        <RedirectCrUXVis redirectUrl={cruxVisUrl} />
      </body>
    </html>
  );
});
