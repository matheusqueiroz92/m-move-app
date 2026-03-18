import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth-store";

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it("sets user", () => {
    const user = { id: "1", name: "Test", email: "t@t.com", role: "STUDENT" };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it("sets loading", () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it("sets initialized", () => {
    useAuthStore.getState().setInitialized(true);
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });

  it("reset clears user and sets initialized", () => {
    useAuthStore
      .getState()
      .setUser({ id: "1", name: "A", email: "a@a.com", role: "STUDENT" });
    useAuthStore.getState().reset();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isInitialized).toBe(true);
  });
});
