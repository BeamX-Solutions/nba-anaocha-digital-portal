import { describe, it, expect } from "vitest";
import { csvCell } from "./utils";

describe("csvCell", () => {
  it("quotes plain values", () => {
    expect(csvCell("John Doe")).toBe('"John Doe"');
    expect(csvCell(42)).toBe('"42"');
    expect(csvCell(null)).toBe('""');
  });

  it("escapes embedded quotes", () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it("defuses spreadsheet formula injection", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe("\"'=HYPERLINK(\"\"http://evil\"\")\"");
    expect(csvCell("+2+3")).toBe("\"'+2+3\"");
    expect(csvCell("@cmd")).toBe("\"'@cmd\"");
    expect(csvCell("-2+3")).toBe("\"'-2+3\"");
  });

  it("leaves a lone dash placeholder untouched", () => {
    expect(csvCell("-")).toBe('"-"');
  });
});
