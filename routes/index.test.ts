import { historyApiMock, queryParamMatrixTest } from "#/tests/utils.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { App } from "fresh";

Deno.test("return RSS", async (t) => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/",
    (await import("./index.tsx")).handler.GET,
  ).handler();

  await queryParamMatrixTest(t, async (matrixTest, searchParams) => {
    const req = new Request(`http://localhost/?${searchParams}`);
    const response = await handler(req);
    const body = await response.text();

    await assertSnapshot(matrixTest, body);
  });
});
