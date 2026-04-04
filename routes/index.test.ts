import { historyApiMock } from "#/tests/utils.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { App } from "fresh";

Deno.test("return RSS", async (t) => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/",
    (await import("./index.tsx")).handler.GET,
  ).handler();

  const req = new Request(
    "http://localhost/?view=cwvsummary&url=https%3A%2F%2Fexample.com%2Fhoge&identifier=origin&device=ALL&periodStart=0&periodEnd=-1&display=p75s",
  );
  const response = await handler(req);
  const body = await response.text();

  await assertSnapshot(t, body);
});
