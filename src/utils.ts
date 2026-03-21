import { FormFactor, QueryRecordOptions, SuccessResponse } from "crux-api";
import { HTTPException } from "@hono/hono/http-exception";

export type ViewType = "cwvsummary";
export type IdentifierType = "url" | "origin";

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
  ALL_FORM_FACTORS: "all devices",
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

export function parseDeviceTypes(device: string | null): FormFactor {
  switch (device) {
    case "PHONE":
      return "PHONE";
    case "TABLET":
      return "TABLET";
    case "DESKTOP":
      return "DESKTOP";
    case "ALL":
    default:
      return "ALL_FORM_FACTORS";
  }
}

export function parseQueryParams(searchParams: URLSearchParams) {
  const url = searchParams.get("url");
  if (!url) {
    throw new HTTPException(400, {
      message: "URL parameter is required",
    });
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

  options.formFactor = device;

  return options;
}

export function createFeedTitle(
  queryParams: ReturnType<typeof parseQueryParams>,
  response: SuccessResponse,
) {
  const viewTypeString = viewTypeStringMap[queryParams.view];
  const identifierString = identifierStringMap[queryParams.identifier];
  const deviceString = deviceStringMap[queryParams.device];

  const normalizedUrl = response.urlNormalizationDetails?.normalizedUrl ||
    queryParams.url;

  return `${viewTypeString} Summary of this ${identifierString}(${normalizedUrl}) on ${deviceString}`;
}
