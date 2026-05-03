import { stub } from "@std/testing/mock";
import { createAssertSnapshot } from "@std/testing/snapshot";
import { FakeTime } from "@std/testing/time";
import { parse, stringify } from "@std/xml";
import { HistoryResponse } from "crux-api";
import {
  supportDeviceType,
  supportDisplayType,
  supportIdentifierType,
  supportViewType,
} from "../src/utils.ts";
import { mockData } from "./queryHistoryRecord_example.ts";

export const assertXmlSnapshot = createAssertSnapshot({
  serializer: (value) => {
    if (typeof value !== "string") {
      throw new Error("Expected a string to serialize as XML snapshot");
    }
    return stringify(parse(value), { indent: "  " });
  },
});

export function historyApiMock(
  responseBody: HistoryResponse = mockData,
) {
  const time = new FakeTime(0);

  const fetchStub = stub(globalThis, "fetch", (input) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes("chromeuxreport.googleapis.com")) {
      return Promise.resolve(
        new Response(JSON.stringify(responseBody), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }
    return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
  });

  return {
    [Symbol.dispose]() {
      fetchStub.restore();
      time.restore();
    },
  };
}

export async function queryParamMatrixTest(
  rootTest: Deno.TestContext,
  handler: (
    matrixTest: Deno.TestContext,
    searchParams: URLSearchParams,
  ) => Promise<void>,
) {
  for await (const view of supportViewType) {
    await rootTest.step(view, async (viewTest) => {
      for await (const identifier of supportIdentifierType) {
        await viewTest.step(identifier, async (identifierTest) => {
          for await (const device of supportDeviceType) {
            await identifierTest.step(device, async (deviceTest) => {
              for await (const display of supportDisplayType) {
                await deviceTest.step(display, async (test) => {
                  const searchParams = new URLSearchParams({
                    view,
                    url: "https://example.com/hoge",
                    identifier,
                    device,
                    periodStart: "0",
                    periodEnd: "-1",
                    display,
                  });

                  await handler(test, searchParams);
                });
              }
            });
          }
        });
      }
    });
  }
}
