import { describe, expect, it } from "vitest";

describe("PostHog API Token Validation", () => {
  it("should successfully ping the PostHog capture endpoint with the configured project token", async () => {
    const token = process.env.VITE_POSTHOG_PROJECT_TOKEN;
    expect(token).toBeDefined();
    expect(token?.length).toBeGreaterThan(10);

    const host = process.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

    // Lightweight ping to PostHog decide/capture endpoint with the project token
    const response = await fetch(`${host}/decide/?v=3`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: token,
        distinct_id: "test-auth-check",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("featureFlags");
  });
});
