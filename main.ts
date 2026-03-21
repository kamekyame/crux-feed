import { Hono } from "@hono/hono";
import { createQueryRecord } from "crux-api";
import { Feed } from "feed";
import { createCruxVisUrl } from "./src/cruxvis.ts";
import { getStatus, thresholds } from "./src/thresholds.ts";
import {
  createFeedTitle,
  createQueryRecordOptions,
  parseQueryParams,
} from "./src/utils.ts";
import { HTTPException } from "@hono/hono/http-exception";

const app = new Hono();

// deno-lint-ignore no-explicit-any
globalThis.window = globalThis as any;

const queryRecord = createQueryRecord({
  key: Deno.env.get("GOOGLE_API_KEY") as string,
});

app.get("/", async (c) => {
  const reqUrl = new URL(c.req.url);

  const reqQueryParams = parseQueryParams(reqUrl.searchParams);
  const CruxQueryOptions = createQueryRecordOptions(reqQueryParams);

  const res = await queryRecord(CruxQueryOptions);
  if (!res) {
    throw new HTTPException(400, {
      message: "Failed to fetch data from CrUX API",
    });
  }
  const record = res.record;

  const feedTitle = createFeedTitle(reqQueryParams, res);
  const feed = new Feed({
    title: feedTitle,
  });

  const date = new Date(Date.UTC(
    record.collectionPeriod.lastDate.year,
    record.collectionPeriod.lastDate.month - 1,
    record.collectionPeriod.lastDate.day,
  ));

  const id = date.getTime().toString();

  if (reqQueryParams.view === "cwvsummary") {
    const lcp = Number(
      record.metrics.largest_contentful_paint?.percentiles.p75,
    );
    const inp = Number(
      record.metrics.interaction_to_next_paint?.percentiles.p75,
    );
    const cls = Number(record.metrics.cumulative_layout_shift?.percentiles.p75);

    const lcpStatus = getStatus(lcp, thresholds.largest_contentful_paint);
    const inpStatus = getStatus(
      inp,
      thresholds.interaction_to_next_paint,
    );
    const clsStatus = getStatus(
      cls,
      thresholds.cumulative_layout_shift,
    );

    const cruxVisUrl = createCruxVisUrl(reqUrl.href.replace(reqUrl.origin, ""));

    feed.addItem({
      title: `${feedTitle} as of ${date.toISOString().split("T")[0]}`,
      id,
      guid: id,
      link: cruxVisUrl,
      date: date,
      content:
        `LCP: ${lcp} (${lcpStatus}), INP: ${inp} (${inpStatus}), CLS: ${cls} (${clsStatus})`,
    });
  }
  return new Response(feed.rss2());
});

export default app;
