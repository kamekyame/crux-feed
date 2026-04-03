import { createQueryHistoryRecord } from "crux-api";

// deno-lint-ignore no-explicit-any
globalThis.window = globalThis as any;

export const queryHistoryRecord = createQueryHistoryRecord({
  key: Deno.env.get("GOOGLE_API_KEY") as string,
});
