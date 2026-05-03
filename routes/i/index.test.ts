import { historyApiMock, queryParamMatrixTest } from "#/tests/utils.ts";
import { decodePNG } from "@img/png";
import { assertEquals } from "@std/assert/equals";
import { exists } from "@std/fs";
import { join } from "@std/path";
import { App } from "fresh";
import pixelmatch from "pixelmatch";

const snapshotDir = new URL("./__snapshots__/", import.meta.url).pathname;
const isUpdateSnapshot = Deno.args.includes("--update");

Deno.test("return cwvsummary image", async (t) => {
  using _ = historyApiMock();
  await Deno.mkdir(snapshotDir, { recursive: true });

  const handler = new App().get(
    "/i",
    (await import("./index.ts")).handler.GET,
  ).handler();

  await queryParamMatrixTest(t, async (_, searchParams, params) => {
    const req = new Request(`http://localhost/i?${searchParams}`);
    const response = await handler(req);
    assertEquals(response.ok, true);
    const actualBytes = await response.bytes();

    const filename =
      `${params.view}_${params.identifier}_${params.device}_${params.display}.png`;
    const snapshotPath = join(snapshotDir, filename);

    if (isUpdateSnapshot) {
      await Deno.writeFile(
        snapshotPath,
        actualBytes,
      );
    }

    if (!await exists(snapshotPath)) {
      throw new Error(`Expected snapshot file does not exist: ${snapshotPath}`);
    }

    const expectedPng = await decodePNG(await Deno.readFile(snapshotPath));
    const actualPng = await decodePNG(actualBytes);
    const diff = new Uint8Array(actualPng.body.length);
    const mismatchedPixel = pixelmatch(
      expectedPng.body,
      actualPng.body,
      diff,
      1200,
      630,
      { threshold: 0.1 },
    );
    assertEquals(
      mismatchedPixel,
      0,
      `Expected image does not match actual image. Mismatched pixels: ${mismatchedPixel}`,
    );
  });
});
