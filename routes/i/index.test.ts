import { historyApiMock } from "#/tests/utils.ts";
import { assertEquals } from "@std/assert";
import { App } from "fresh";

Deno.test("return cwvsummary image", async () => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/i",
    (await import("./index.ts")).handler.GET,
  ).handler();

  const req = new Request(
    "http://localhost/i?view=cwvsummary&url=https%3A%2F%2Fexample.com%2Fhoge&identifier=origin&device=ALL&periodStart=0&periodEnd=-1&display=p75s",
  );
  const response = await handler(req);
  assertEquals(response.ok, true);
});
