import {
  createCwvsummaryOgImage,
  initChart,
  normalizeByThreshold,
} from "#/src/chart.ts";
import { queryHistoryRecord } from "#/src/cruxapi.ts";
import { getThresholds } from "#/src/thresholds.ts";
import {
  convertMetricDate,
  createQueryRecordOptions,
  parseQueryParams,
} from "#/src/utils.ts";
import { define } from "#/utils.ts";
import { zip } from "@std/collections/zip";
import { HttpError } from "fresh";

initChart();

export const handler = define.handlers({
  async GET(c) {
    const reqUrl = new URL(c.req.url);
    const reqQueryParams = parseQueryParams(reqUrl.searchParams);
    const asof = reqUrl.searchParams.get("asof");

    if (reqQueryParams.view === "cwvsummary") {
      const CruxQueryOptions = createQueryRecordOptions(reqQueryParams);

      const res = await queryHistoryRecord(CruxQueryOptions);
      if (!res) {
        throw new HttpError(400, "Failed to fetch data from CrUX API");
      }

      const record = res.record;

      const lcpThresholds = getThresholds(
        record.metrics.largest_contentful_paint?.histogramTimeseries ?? [],
      );
      const inpThresholds = getThresholds(
        record.metrics.interaction_to_next_paint?.histogramTimeseries ?? [],
      );
      const clsThresholds = getThresholds(
        record.metrics.cumulative_layout_shift?.histogramTimeseries ?? [],
      );

      const labels: string[] = [];
      const lcpSeries: number[] = [];
      const inpSeries: number[] = [];
      const clsSeries: number[] = [];

      const lastDataIndex = record.collectionPeriods.findIndex((period) => {
        const lastDate = convertMetricDate(period.lastDate);
        return lastDate.dateString === asof;
      });

      zip(
        record.collectionPeriods,
        record.metrics.largest_contentful_paint?.percentilesTimeseries
          .p75s ?? [],
        record.metrics.interaction_to_next_paint?.percentilesTimeseries
          .p75s ?? [],
        record.metrics.cumulative_layout_shift?.percentilesTimeseries
          .p75s ?? [],
      ).forEach(([period, lcpP75, inpP75, clsP75], idx) => {
        if (lastDataIndex > 0 && idx > lastDataIndex) return;
        labels.push(convertMetricDate(period.lastDate).dateString);
        lcpSeries.push(normalizeByThreshold(Number(lcpP75), lcpThresholds));
        inpSeries.push(normalizeByThreshold(Number(inpP75), inpThresholds));
        clsSeries.push(normalizeByThreshold(Number(clsP75), clsThresholds));
      });

      const png = await createCwvsummaryOgImage({
        labels,
        lcpSeries,
        inpSeries,
        clsSeries,
      });

      return new Response(Uint8Array.from(png), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=1800",
        },
      });
    }

    throw new HttpError(404);
  },
});
