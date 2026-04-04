import { historyApiMock } from "#/tests/utils.ts";
import { assertEquals, AssertionError } from "@std/assert";
import { ensureDir } from "@std/fs";
import { dirname, fromFileUrl } from "@std/path";
import { App } from "fresh";

const createSnapshotImageUrl = (t: Deno.TestContext) => {
  const url = new URL(
    `./__snapshots__/${t.name}.png`,
    import.meta.url,
  );
  return fromFileUrl(url);
};

function shouldUpdateSnapshot() {
  return Deno.args.includes("--update");
}

Deno.test("return cwvsummary image", async (t) => {
  using _ = historyApiMock();

  const handler = new App().get(
    "/i",
    (await import("./index.ts")).handler.GET,
  ).handler();

  const req = new Request(
    "http://localhost/i?view=cwvsummary&url=https%3A%2F%2Fexample.com%2Fhoge&identifier=origin&device=ALL&periodStart=0&periodEnd=-1&display=p75s",
  );
  const response = await handler(req);
  const actualImage = new Uint8Array(await response.arrayBuffer());

  const snapshotPath = createSnapshotImageUrl(t);
  await ensureDir(dirname(snapshotPath));
  if (shouldUpdateSnapshot()) {
    await Deno.writeFile(snapshotPath, actualImage);
  }

  const expectedImage = await Deno.readFile(snapshotPath).catch(() => {
    throw new AssertionError("Missing snapshot file");
  });

  assertEquals(actualImage, expectedImage);
});
