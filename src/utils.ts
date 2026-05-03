import { HttpError } from "fresh";
import { HistoryResponse, MetricDate, QueryRecordOptions } from "crux-api";

export const supportViewType = [
  "cwvsummary",
  "lcp",
  "inp",
  "cls",
  "fcp",
  "ttfb",
  "rtt",
] as const;
export const supportIdentifierType = ["origin", "url"] as const;
export const supportDeviceType = ["ALL", "PHONE", "DESKTOP", "TABLET"] as const;
export const supportDisplayType = ["p75s", "distributions", "both"] as const;
export type ViewType = (typeof supportViewType)[number];
export type IdentifierType = (typeof supportIdentifierType)[number];
export type DeviceType = (typeof supportDeviceType)[number];
export type DisplayType = (typeof supportDisplayType)[number];

export const viewTypeStringMap: Record<ViewType, string> = {
  cwvsummary: "Core Web Vitals",
  lcp: "Largest Contentful Paint (LCP)",
  inp: "Interaction to Next Paint (INP)",
  cls: "Cumulative Layout Shift (CLS)",
  fcp: "First Contentful Paint (FCP)",
  ttfb: "Time to First Byte (TTFB)",
  rtt: "Round Trip Time (RTT)",
};

const identifierStringMap: Record<IdentifierType, string> = {
  url: "URL",
  origin: "Origin",
};

const deviceStringMap: Record<DeviceType, string> = {
  PHONE: "phones",
  TABLET: "tablets",
  DESKTOP: "desktops",
  ALL: "all devices",
};

export const viewMetricMap = {
  lcp: "largest_contentful_paint",
  inp: "interaction_to_next_paint",
  cls: "cumulative_layout_shift",
  fcp: "first_contentful_paint",
  ttfb: "experimental_time_to_first_byte",
  rtt: "round_trip_time",
} as const;

export function parseViewTypes(view: string | null): ViewType {
  if (supportViewType.includes(view as ViewType)) {
    return view as ViewType;
  } else if (view === "loadingperf") {
    return "lcp";
  } else if (view === "interactivity") {
    return "inp";
  } else if (view === "visstability") {
    return "cls";
  } else if (view === "allmetrics") {
    return "lcp";
  } else {
    return "cwvsummary";
  }
}

export function parseIdentifierTypes(
  identifier: string | null,
): IdentifierType {
  switch (identifier) {
    case "origin":
      return "origin";
    case "url":
    default:
      return "url";
  }
}

export function parseDeviceTypes(device: string | null): DeviceType {
  switch (device) {
    case "PHONE":
      return "PHONE";
    case "TABLET":
      return "TABLET";
    case "DESKTOP":
      return "DESKTOP";
    case "ALL":
    default:
      return "ALL";
  }
}

export function parseDisplayTypes(display: string | null): DisplayType {
  switch (display) {
    case "p75s":
      return "p75s";
    case "distributions":
      return "distributions";
    case "both":
      return "both";
    default:
      return "p75s";
  }
}

export function parseQueryParams(searchParams: URLSearchParams) {
  const url = searchParams.get("url");
  if (!url) {
    throw new HttpError(400, "URL parameter is required");
  }

  const view = parseViewTypes(searchParams.get("view"));
  const identifier = parseIdentifierTypes(searchParams.get("identifier"));
  const device = parseDeviceTypes(searchParams.get("device"));
  const display = parseDisplayTypes(searchParams.get("display"));

  return { view, url, identifier, device, display };
}

export function createQueryRecordOptions(
  parsedQueryParams: ReturnType<typeof parseQueryParams>,
) {
  const { url: origin, identifier, device, view } = parsedQueryParams;

  const options: QueryRecordOptions = {};

  if (identifier === "origin") {
    options.origin = origin;
  } else {
    options.url = origin;
  }

  switch (view) {
    case "cwvsummary":
      options.metrics = [
        "largest_contentful_paint",
        "interaction_to_next_paint",
        "cumulative_layout_shift",
      ];
      break;
  }

  options.formFactor = device === "ALL" ? "ALL_FORM_FACTORS" : device;

  return options;
}

export function createFeedTitle(
  queryParams: ReturnType<typeof parseQueryParams>,
  response?: HistoryResponse,
) {
  const viewTypeString = viewTypeStringMap[queryParams.view];
  const identifierString = identifierStringMap[queryParams.identifier];
  const deviceString = deviceStringMap[queryParams.device];

  const normalizedUrl = response?.urlNormalizationDetails?.normalizedUrl ||
    queryParams.url;

  if (queryParams.view === "cwvsummary") {
    return `${viewTypeString} Summary of this ${identifierString}(${normalizedUrl}) on ${deviceString}`;
  } else {
    return `${viewTypeString} of this ${identifierString}(${normalizedUrl}) on ${deviceString}`;
  }
}

export function getGrowthRateStatus(value: number, lastValue: number) {
  const growthRate = (value - lastValue) / lastValue;

  if (growthRate >= 0.02) {
    return "but is regressing";
  } else if (growthRate <= -0.02) {
    return "and improving";
  } else {
    return "and stable";
  }
}

export function convertMetricDate(date: MetricDate) {
  const d = new Date(Date.UTC(
    date.year,
    date.month - 1,
    date.day,
  ));
  return { date: d, dateString: d.toISOString().split("T")[0] };
}

export function getMetric(
  res: HistoryResponse,
  view: Exclude<ViewType, "cwvsummary">,
) {
  const metricName = viewMetricMap[view];
  return res.record.metrics[metricName];
}
