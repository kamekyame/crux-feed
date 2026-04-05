import { assertXmlSnapshot, historyApiMock } from "#/tests/utils.ts";
import { App } from "fresh";

Deno.test("return Redirect Page", async (t) => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/r",
    (await import("./index.tsx")).handler.GET,
  ).handler();

  const req = new Request(
    "http://localhost/r?view=cwvsummary&url=https%3A%2F%2Fexample.com%2Fhoge&identifier=origin&device=ALL&periodStart=0&periodEnd=-1&display=p75s",
  );
  const response = await handler(req);
  let body = await response.text();
  body = body.replace(/nonce="\w*"/g, 'nonce=""');

  await assertXmlSnapshot(t, body);
});
