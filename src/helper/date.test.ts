import { formatDateOnly } from "./date";

describe("formatDateOnly", () => {
  it("formats a date-only string as dd/mm/aaaa", () => {
    expect(formatDateOnly("2026-07-15")).toBe("15/07/2026");
  });

  it("formats a full ISO timestamp using only the date part (no UTC→local shift)", () => {
    // "2026-07-15T00:00:00" parsed as UTC would render 14/07 in GMT-3;
    // the date-only part must be kept as-is.
    expect(formatDateOnly("2026-07-15T00:00:00")).toBe("15/07/2026");
    expect(formatDateOnly("2026-07-15T23:59:59")).toBe("15/07/2026");
  });

  it("returns empty string for nullish input", () => {
    expect(formatDateOnly(null)).toBe("");
    expect(formatDateOnly(undefined)).toBe("");
    expect(formatDateOnly("")).toBe("");
  });

  it("falls back to locale formatting for non-ISO input", () => {
    expect(formatDateOnly("15/07/2026")).toBe(new Date("15/07/2026").toLocaleDateString("pt-BR"));
  });
});
