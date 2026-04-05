import { createQueryHistoryRecord } from "crux-api";

export const queryHistoryRecord = createQueryHistoryRecord({
  key: Deno.env.get("GOOGLE_API_KEY") as string,
  fetch: globalThis.fetch,
});
