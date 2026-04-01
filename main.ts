import { Hono } from "@hono/hono";
import { createQueryHistoryRecord } from "crux-api";
import { Feed } from "feed";
import { createCruxVisUrl } from "./src/cruxvis.ts";
import { getStatus, getThresholds } from "./src/thresholds.ts";
import {
  convertMetricDate,
  createFeedTitle,
  createQueryRecordOptions,
  getGrowthRateStatus,
  parseQueryParams,
} from "./src/utils.ts";
import { HTTPException } from "@hono/hono/http-exception";

const app = new Hono();

// deno-lint-ignore no-explicit-any
globalThis.window = globalThis as any;

const queryRecord2 = createQueryHistoryRecord({
  key: Deno.env.get("GOOGLE_API_KEY") as string,
});

app.get("/", async (c) => {
  const reqUrl = new URL(c.req.url);

  const reqQueryParams = parseQueryParams(reqUrl.searchParams);
  const CruxQueryOptions = createQueryRecordOptions(reqQueryParams);

  const res = await queryRecord2(CruxQueryOptions);
  if (!res) {
    throw new HTTPException(400, {
      message: "Failed to fetch data from CrUX API",
    });
  }
  const record = res.record;

  const feedTitle = createFeedTitle(reqQueryParams, res);
  const feed = new Feed({
    title: feedTitle,
    link: "https://github.com/kamekyame/crux-feed",
    feed: reqUrl.href,
    ttl: 12 * 60, // 12 hours
  });

  const cruxVisUrl = createCruxVisUrl(reqQueryParams);

  if (reqQueryParams.view === "cwvsummary") {
    const periods = record.collectionPeriods;

    const lcpThresholds = getThresholds(
      record.metrics.largest_contentful_paint?.histogramTimeseries ?? [],
    );
    const inpThresholds = getThresholds(
      record.metrics.interaction_to_next_paint?.histogramTimeseries ?? [],
    );
    const clsThresholds = getThresholds(
      record.metrics.cumulative_layout_shift?.histogramTimeseries ?? [],
    );

    periods.reverse().forEach((period, i) => {
      const idx = periods.length - 1 - i;
      if (idx === 0) return;

      const firstDate = convertMetricDate(period.firstDate);
      const lastDate = convertMetricDate(period.lastDate);

      const lcp = Number(
        record.metrics.largest_contentful_paint?.percentilesTimeseries
          .p75s[idx],
      );
      const lcpStatus = getStatus(lcp, lcpThresholds);
      const lastLcp = Number(
        record.metrics.largest_contentful_paint?.percentilesTimeseries
          .p75s[idx - 1],
      );
      const lspGrowthRateString = getGrowthRateStatus(lcp, lastLcp);

      const inp = Number(
        record.metrics.interaction_to_next_paint?.percentilesTimeseries
          .p75s[idx],
      );
      const inpStatus = getStatus(inp, inpThresholds);
      const lastInp = Number(
        record.metrics.interaction_to_next_paint?.percentilesTimeseries
          .p75s[idx - 1],
      );
      const inpGrowthRateString = getGrowthRateStatus(inp, lastInp);

      const cls = Number(
        record.metrics.cumulative_layout_shift?.percentilesTimeseries
          .p75s[idx],
      );
      const clsStatus = getStatus(cls, clsThresholds);
      const lastCls = Number(
        record.metrics.cumulative_layout_shift?.percentilesTimeseries
          .p75s[idx - 1],
      );
      const clsGrowthRateString = getGrowthRateStatus(cls, lastCls);

      const description = [
        `Loading Performance is ${lcpStatus} ${lspGrowthRateString} - value: ${lcp}`,
        `Interactivity is ${inpStatus} ${inpGrowthRateString} - value: ${inp}`,
        `Visual Stability is ${clsStatus} ${clsGrowthRateString} - value: ${cls}`,
      ].join("<br>");

      const id = lastDate.date.getTime().toString();

      feed.addItem({
        title:
          `${feedTitle} from ${firstDate.dateString} to ${lastDate.dateString}`,
        id,
        guid: id,
        link: cruxVisUrl,
        date: lastDate.date,
        description,
      });
    });
  }
  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
});

export default app;
