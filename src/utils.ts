import { HttpError } from "@fresh/core";
import { HistoryResponse, MetricDate, QueryRecordOptions } from "crux-api";

export type ViewType = "cwvsummary";
export type IdentifierType = "url" | "origin";
export type DeviceType = "PHONE" | "TABLET" | "DESKTOP" | "ALL";

const viewTypeStringMap = {
  cwvsummary: "Core Web Vitals",
};

const identifierStringMap = {
  url: "URL",
  origin: "Origin",
};

const deviceStringMap = {
  PHONE: "phones",
  TABLET: "tablets",
  DESKTOP: "desktops",
  ALL: "all devices",
};

export function parseViewTypes(view: string | null): ViewType {
  switch (view) {
    case "cwvsummary":
    default:
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

export function parseQueryParams(searchParams: URLSearchParams) {
  const url = searchParams.get("url");
  if (!url) {
    throw new HttpError(400, "URL parameter is required");
  }

  const view = parseViewTypes(searchParams.get("view"));
  const identifier = parseIdentifierTypes(searchParams.get("identifier"));
  const device = parseDeviceTypes(searchParams.get("device"));

  return { view, url, identifier, device };
}

export function createQueryRecordOptions(
  parsedQueryParams: ReturnType<typeof parseQueryParams>,
) {
  const { url: origin, identifier, device } = parsedQueryParams;

  const options: QueryRecordOptions = {};

  if (identifier === "origin") {
    options.origin = origin;
  } else {
    options.url = origin;
  }

  options.formFactor = device === "ALL" ? "ALL_FORM_FACTORS" : device;

  return options;
}

export function createFeedTitle(
  queryParams: ReturnType<typeof parseQueryParams>,
  response: HistoryResponse,
) {
  const viewTypeString = viewTypeStringMap[queryParams.view];
  const identifierString = identifierStringMap[queryParams.identifier];
  const deviceString = deviceStringMap[queryParams.device];

  const normalizedUrl = response.urlNormalizationDetails?.normalizedUrl ||
    queryParams.url;

  return `${viewTypeString} Summary of this ${identifierString}(${normalizedUrl}) on ${deviceString}`;
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
