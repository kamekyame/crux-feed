import { queryHistoryRecord } from "#/src/cruxapi.ts";
import { getStatus, getThresholds } from "#/src/thresholds.ts";
import {
  convertMetricDate,
  createFeedTitle,
  createQueryRecordOptions,
  getGrowthRateStatus,
  getMetric,
  parseQueryParams,
} from "#/src/utils.ts";
import { define } from "#/utils.ts";
import { zip } from "@std/collections/zip";
import { Feed } from "feed";
import { HttpError } from "fresh";

export const handler = define.handlers({
  async GET(c) {
    const reqUrl = new URL(c.req.url);

    const reqQueryParams = parseQueryParams(reqUrl.searchParams);
    const CruxQueryOptions = createQueryRecordOptions(reqQueryParams);

    const res = await queryHistoryRecord(CruxQueryOptions);
    if (!res) {
      throw new HttpError(400, "Failed to fetch data from CrUX API");
    }
    const record = res.record;

    const feedTitle = createFeedTitle(reqQueryParams, res);
    const feed = new Feed({
      title: feedTitle,
      link: "https://github.com/kamekyame/crux-feed",
      feed: reqUrl.href,
      ttl: 12 * 60, // 12 hours
    });

    if (reqQueryParams.view === "cwvsummary") {
      const lcpThresholds = getThresholds(
        record.metrics.largest_contentful_paint?.histogramTimeseries ?? [],
      );
      const inpThresholds = getThresholds(
        record.metrics.interaction_to_next_paint?.histogramTimeseries ?? [],
      );
      const clsThresholds = getThresholds(
        record.metrics.cumulative_layout_shift?.histogramTimeseries ?? [],
      );

      const data = zip(
        record.collectionPeriods,
        record.metrics.largest_contentful_paint?.percentilesTimeseries
          .p75s ?? [],
        record.metrics.interaction_to_next_paint?.percentilesTimeseries
          .p75s ?? [],
        record.metrics.cumulative_layout_shift?.percentilesTimeseries
          .p75s ?? [],
      ).toReversed();

      data.forEach((d, i) => {
        const [period, lcpP75, inpP75, clsP75] = d;
        const lastData = data[i + 1];
        if (!lastData) return;
        const [_, lastLcpP75, lastInpP75, lastClsP75] = lastData;

        const lastDate = convertMetricDate(period.lastDate);

        const lcp = Number(lcpP75);
        const lcpStatus = getStatus(lcp, lcpThresholds);
        const lastLcp = Number(lastLcpP75);

        const lspGrowthRateString = getGrowthRateStatus(lcp, lastLcp);

        const inp = Number(inpP75);
        const inpStatus = getStatus(inp, inpThresholds);
        const lastInp = Number(lastInpP75);
        const inpGrowthRateString = getGrowthRateStatus(inp, lastInp);

        const cls = Number(clsP75);
        const clsStatus = getStatus(cls, clsThresholds);
        const lastCls = Number(lastClsP75);
        const clsGrowthRateString = getGrowthRateStatus(cls, lastCls);

        const description = [
          `Loading Performance is ${lcpStatus} ${lspGrowthRateString} - value: ${lcp}`,
          `Interactivity is ${inpStatus} ${inpGrowthRateString} - value: ${inp}`,
          `Visual Stability is ${clsStatus} ${clsGrowthRateString} - value: ${cls}`,
        ].join("<br>");

        const id = lastDate.date.getTime().toString();

        const redirectPageUrl = new URL(
          `${reqUrl.origin}/r?${reqUrl.searchParams.toString()}`,
        );
        redirectPageUrl.searchParams.set("asof", lastDate.dateString);

        feed.addItem({
          title: `${feedTitle} as of ${lastDate.dateString}`,
          id,
          guid: id,
          link: redirectPageUrl.href,
          date: lastDate.date,
          description,
        });
      });
    } else {
      const metric = getMetric(res, reqQueryParams.view);
      const data = zip(
        record.collectionPeriods,
        metric?.percentilesTimeseries
          .p75s ?? [],
        metric?.histogramTimeseries[0]?.densities ?? [],
        metric?.histogramTimeseries[1]?.densities ?? [],
        metric?.histogramTimeseries[2]?.densities ?? [],
      ).toReversed();

      data.forEach((d) => {
        const [period, p75, goodDensity, needsImprovementDensity, poorDensity] =
          d;

        const lastDate = convertMetricDate(period.lastDate);

        const value = Number(p75);
        const goodValue = (Number(goodDensity) * 100).toFixed(1);
        const needsImprovementValue = (Number(needsImprovementDensity) * 100)
          .toFixed(1);
        const poorValue = (Number(poorDensity) * 100).toFixed(1);

        const descriptionList = [];
        if (reqQueryParams.display !== "p75s") {
          descriptionList.push("");
          descriptionList.push(
            `Among ${reqQueryParams.device.toLowerCase()} page loads of this ${
              reqQueryParams.identifier === "origin" ? "origin" : "URL"
            },`,
          );
          descriptionList.push(
            `${goodValue}% experienced good ${reqQueryParams.view.toUpperCase()}`,
          );
          descriptionList.push(
            `${needsImprovementValue}% experienced needs improvement ${reqQueryParams.view.toUpperCase()}`,
          );
          descriptionList.push(
            `${poorValue}% experienced poor ${reqQueryParams.view.toUpperCase()}`,
          );
        }
        if (reqQueryParams.display !== "distributions") {
          descriptionList.push(
            `75% of ${reqQueryParams.device.toLowerCase()} page loads of this ${
              reqQueryParams.identifier === "origin" ? "origin" : "URL"
            } experienced ${reqQueryParams.view.toUpperCase()} of ≤ ${value}`,
          );
        }
        const description = descriptionList.join("<br>");

        const id = lastDate.date.getTime().toString();

        const redirectPageUrl = new URL(
          `${reqUrl.origin}/r?${reqUrl.searchParams.toString()}`,
        );
        redirectPageUrl.searchParams.set("asof", lastDate.dateString);

        feed.addItem({
          title: `${feedTitle} as of ${lastDate.dateString}`,
          id,
          guid: id,
          link: redirectPageUrl.href,
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
  },
});
