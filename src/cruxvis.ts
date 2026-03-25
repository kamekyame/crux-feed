import { parseQueryParams } from "./utils.ts";

const cruxVisBaseUrl = "https://cruxvis.withgoogle.com/#/";

export function createCruxVisUrl(params: ReturnType<typeof parseQueryParams>) {
  const sp = new URLSearchParams();

  sp.set("url", params.url);
  sp.set("view", params.view);
  sp.set("identifier", params.identifier);
  sp.set("device", params.device);

  return `${cruxVisBaseUrl}?${sp.toString()}`;
}
