import { HistorgramTimeserie } from "crux-api";

type Threshold = {
  /** good threshold value (good <> needs improvement) */
  good: number;
  /** needs improvement threshold value (needs improvement <> poor) */
  needs_improvement: number;
};

export function getStatus(value: number, threshold: Threshold) {
  if (value <= threshold.good) {
    return "good";
  } else if (value <= threshold.needs_improvement) {
    return "needs improvement";
  } else {
    return "poor";
  }
}

export function getThresholds(timeseries: HistorgramTimeserie[]) {
  const good = Number(timeseries[1].start);
  const needs_improvement = Number(timeseries[2].start);
  return { good, needs_improvement };
}
