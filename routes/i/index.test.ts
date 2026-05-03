import { historyApiMock, queryParamMatrixTest } from "#/tests/utils.ts";
import { App } from "fresh";
import { assertEquals } from "@std/assert/equals";

Deno.test("return cwvsummary image", async (t) => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/i",
    (await import("./index.ts")).handler.GET,
  ).handler();

  await queryParamMatrixTest(t, async (_, searchParams) => {
    const req = new Request(`http://localhost/i?${searchParams}`);
    const response = await handler(req);
    assertEquals(response.ok, true);
  });
});
