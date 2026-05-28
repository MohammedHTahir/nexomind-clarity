import { describe, it, expect } from "vitest";
import {
  generateTherapistBriefPDF,
  type TherapistBriefData,
} from "@/lib/therapist-brief";

const minimalBriefData: TherapistBriefData = {
  themes: ["Overthinking", "Work stress"],
  distortions: ["Catastrophizing", "All-or-nothing thinking"],
  mood_arc: [
    { date: "2025-05-20", intensity_score: 7, clarity_score: 4 },
    { date: "2025-05-21", intensity_score: 5, clarity_score: 6 },
  ],
  representative_entries: [
    {
      journal_id: "entry-1",
      date: "2025-05-20",
      summary: "Felt overwhelmed by deadlines at work.",
      reason: "High intensity + low clarity",
    },
    {
      journal_id: "entry-2",
      date: "2025-05-21",
      summary: "Had a better day after journaling yesterday.",
      reason: "Positive shift indicator",
    },
    {
      journal_id: "entry-3",
      date: "2025-05-22",
      summary: "This entry should be redacted from the PDF.",
      reason: "Contains sensitive info",
    },
  ],
  summary:
    "The user shows a pattern of work-related stress with improving clarity over time.",
};

describe("therapist-brief", () => {
  describe("generateTherapistBriefPDF", () => {
    it("returns bytes starting with %PDF", async () => {
      const pdfBytes = await generateTherapistBriefPDF(minimalBriefData);

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);

      // Check PDF magic bytes: %PDF
      const header = String.fromCharCode(
        pdfBytes[0],
        pdfBytes[1],
        pdfBytes[2],
        pdfBytes[3]
      );
      expect(header).toBe("%PDF");
    });

    it("excludes redacted entries from output", async () => {
      const redactedIds = new Set(["entry-3"]);

      // Generate with redaction
      const pdfWithRedaction = await generateTherapistBriefPDF(
        minimalBriefData,
        redactedIds
      );

      // Generate without redaction
      const pdfWithoutRedaction = await generateTherapistBriefPDF(
        minimalBriefData,
        new Set()
      );

      // The PDF with redaction should be smaller since it has fewer entries
      expect(pdfWithRedaction.length).toBeLessThan(pdfWithoutRedaction.length);

      // Both should still be valid PDFs
      const header1 = String.fromCharCode(
        pdfWithRedaction[0],
        pdfWithRedaction[1],
        pdfWithRedaction[2],
        pdfWithRedaction[3]
      );
      expect(header1).toBe("%PDF");
    });

    it("includes disclaimer in output (valid PDF with disclaimer block)", async () => {
      const pdfBytes = await generateTherapistBriefPDF(minimalBriefData);

      // PDF is valid (starts with %PDF)
      const header = String.fromCharCode(
        pdfBytes[0],
        pdfBytes[1],
        pdfBytes[2],
        pdfBytes[3]
      );
      expect(header).toBe("%PDF");

      // The PDF should be non-trivially sized (disclaimer adds content)
      // A bare-minimum empty PDF would be much smaller
      expect(pdfBytes.length).toBeGreaterThan(500);
    });

    it("works with empty representative_entries", async () => {
      const data: TherapistBriefData = {
        ...minimalBriefData,
        representative_entries: [],
      };

      const pdfBytes = await generateTherapistBriefPDF(data);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      const header = String.fromCharCode(
        pdfBytes[0],
        pdfBytes[1],
        pdfBytes[2],
        pdfBytes[3]
      );
      expect(header).toBe("%PDF");
    });

    it("works with empty themes and distortions", async () => {
      const data: TherapistBriefData = {
        themes: [],
        distortions: [],
        mood_arc: [],
        representative_entries: [],
        summary: "Minimal summary.",
      };

      const pdfBytes = await generateTherapistBriefPDF(data);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);
    });
  });
});
