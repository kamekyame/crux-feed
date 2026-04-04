import { stub } from "@std/testing/mock";
import { createAssertSnapshot } from "@std/testing/snapshot";
import { FakeTime } from "@std/testing/time";
import { parse, stringify } from "@std/xml";
import { HistoryResponse } from "crux-api";
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
