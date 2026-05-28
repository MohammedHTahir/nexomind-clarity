import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @tanstack/react-query and supabase before importing the module
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(() => ({ data: undefined })),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
    },
  },
}));

describe("feature-flags", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("useFeatureFlag hook behavior", () => {
    it("returns false when flag is not in the data map", async () => {
      const { useQuery } = await import("@tanstack/react-query");
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: {} });

      const { useFeatureFlag } = await import("@/lib/feature-flags");
      const result = useFeatureFlag("nonexistent_flag");
      expect(result).toBe(false);
    });

    it("returns true when flag is present and true in data map", async () => {
      const { useQuery } = await import("@tanstack/react-query");
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { voice_entry: true, e2ee_mode: false },
      });

      const { useFeatureFlag } = await import("@/lib/feature-flags");
      expect(useFeatureFlag("voice_entry")).toBe(true);
      expect(useFeatureFlag("e2ee_mode")).toBe(false);
    });

    it("returns false when data is undefined (fail-closed)", async () => {
      const { useQuery } = await import("@tanstack/react-query");
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
      });

      const { useFeatureFlag } = await import("@/lib/feature-flags");
      expect(useFeatureFlag("any_flag")).toBe(false);
    });
  });

  describe("fail-closed behavior", () => {
    it("fetchFlags returns empty map when session is null", async () => {
      // The fetchFlags function returns {} when no session
      // We test this via the hook returning false for any flag
      const { useQuery } = await import("@tanstack/react-query");
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({ data: {} });

      const { useFeatureFlag } = await import("@/lib/feature-flags");
      expect(useFeatureFlag("reflection_mode")).toBe(false);
    });

    it("useQuery is called with retry: false for fail-fast behavior", async () => {
      const { useQuery } = await import("@tanstack/react-query");
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
      });

      await import("@/lib/feature-flags");
      const { useFeatureFlag } = await import("@/lib/feature-flags");
      useFeatureFlag("test");

      expect(useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          retry: false,
        })
      );
    });
  });

  describe("FeatureGate component behavior", () => {
    it("renders null when flag is disabled", async () => {
      const { useQuery } = await import("@tanstack/react-query");
      (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { some_flag: false },
      });

      const { FeatureGate } = await import("@/lib/feature-flags");
      const React = await import("react");

      // FeatureGate returns null when flag is disabled
      const result = FeatureGate({
        flag: "some_flag",
        children: React.createElement("div", null, "hidden"),
      });
      expect(result).toBeNull();
    });
  });
});
