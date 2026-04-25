import { parseQueryParams } from "./utils.ts";

const cruxVisBaseUrl = "https://cruxvis.withgoogle.com/#/";

export function createCruxVisUrl(params: ReturnType<typeof parseQueryParams>) {
  const sp = new URLSearchParams();

  const cruxVisView = params.view === "cwvsummary"
    ? "cwvsummary"
    : "allmetrics";

  sp.set("url", params.url);
  sp.set("view", cruxVisView);
  sp.set("identifier", params.identifier);
  sp.set("device", params.device);

  return `${cruxVisBaseUrl}?${sp.toString()}`;
}
