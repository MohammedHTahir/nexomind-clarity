import { describe, it, expect } from "vitest";
import { t, formatDate, formatNumber } from "@/lib/i18n";

describe("i18n", () => {
  describe("t()", () => {
    it("returns correct en-US string for a known key", () => {
      expect(t("general.save")).toBe("Save");
    });

    it("returns the key as fallback for an unknown key", () => {
      expect(t("nonexistent.key.here")).toBe("nonexistent.key.here");
    });

    it("interpolates {{name}} params correctly", () => {
      // "inbox.letterTitle": "Week of {{date}}"
      const result = t("inbox.letterTitle", { date: "June 1" });
      expect(result).toBe("Week of June 1");
    });

    it("interpolates multiple params", () => {
      // "persona.youMentorProgress": "{{current}}/{{total}} entries"
      const result = t("persona.youMentorProgress", {
        current: "15",
        total: "30",
      });
      expect(result).toBe("15/30 entries");
    });

    it("returns uninterpolated string when params are not provided", () => {
      const result = t("inbox.letterTitle");
      expect(result).toBe("Week of {{date}}");
    });
  });

  describe("formatDate", () => {
    it("formats a Date object without throwing", () => {
      const result = formatDate(new Date(2025, 0, 15));
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("formats a date string without throwing", () => {
      const result = formatDate("2025-06-01T00:00:00Z");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("formats with custom options", () => {
      const result = formatDate(new Date(2025, 5, 1), {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      expect(result).toContain("June");
      expect(result).toContain("2025");
    });
  });

  describe("formatNumber", () => {
    it("returns a formatted string for a whole number", () => {
      const result = formatNumber(1000);
      expect(result).toBe("1,000");
    });

    it("returns a formatted string for a decimal", () => {
      const result = formatNumber(3.14159, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toBe("3.14");
    });

    it("formats zero correctly", () => {
      expect(formatNumber(0)).toBe("0");
    });
  });
});
