import { getApiBaseUrl } from "@/lib/api/base-url";

describe("api base url", () => {
  it("uses explicit env value first", () => {
    expect(getApiBaseUrl("http://10.0.0.8:7777")).toBe("http://10.0.0.8:7777");
  });

  it("uses browser host when env is missing", () => {
    Object.defineProperty(window, "location", {
      value: {
        protocol: "http:",
        hostname: "192.168.1.10",
      },
      writable: true,
    });

    expect(getApiBaseUrl()).toBe("http://192.168.1.10:7777");
  });
});
