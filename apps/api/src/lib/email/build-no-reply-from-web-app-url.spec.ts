import { describe, expect, it } from "vitest";

import {
  buildNoReplyFromAddress,
  replaceResetUrlOriginForWebApp,
} from "./build-no-reply-from-web-app-url.js";

describe("buildNoReplyFromAddress", () => {
  it("returns no-reply@hostname from WEB_APP_BASE_URL", () => {
    expect(buildNoReplyFromAddress("https://app.exemplo.com")).toBe(
      "no-reply@app.exemplo.com",
    );
    expect(buildNoReplyFromAddress("http://localhost:3000")).toBe(
      "no-reply@localhost",
    );
  });

  it("uses override when provided", () => {
    expect(
      buildNoReplyFromAddress(
        "https://app.exemplo.com",
        "  mail@dominio.com  ",
      ),
    ).toBe("mail@dominio.com");
  });
});

describe("replaceResetUrlOriginForWebApp", () => {
  it("replaces API origin with web origin", () => {
    expect(
      replaceResetUrlOriginForWebApp(
        "http://localhost:3001/api/auth/reset-password?token=abc",
        "http://localhost:3001",
        "http://localhost:3000",
      ),
    ).toBe("http://localhost:3000/api/auth/reset-password?token=abc");
  });

  it("returns original url on parse error", () => {
    const bad = "not-a-url";
    expect(
      replaceResetUrlOriginForWebApp(bad, "http://localhost:3001", "oops"),
    ).toBe(bad);
  });
});
