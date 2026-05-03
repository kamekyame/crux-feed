import {
  assertXmlSnapshot,
  historyApiMock,
  queryParamMatrixTest,
} from "#/tests/utils.ts";
import { App } from "fresh";

Deno.test("return Redirect Page", async (t) => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/r",
    (await import("./index.tsx")).handler.GET,
  ).handler();

  await queryParamMatrixTest(t, async (matrixTest, searchParams) => {
    const req = new Request(`http://localhost/r?${searchParams}`);
    const response = await handler(req);
    let body = await response.text();
    body = body.replace(/nonce="\w*"/g, 'nonce=""');

    await assertXmlSnapshot(matrixTest, body);
  });
});
