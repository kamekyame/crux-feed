const cruxVisBaseUrl = "https://cruxvis.withgoogle.com/";

export function createCruxVisUrl(reqPath: string) {
  const cruxUrl = new URL(reqPath, cruxVisBaseUrl);
  return cruxUrl.href;
}
