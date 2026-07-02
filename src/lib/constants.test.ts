import { describe, it, expect } from "vitest";
import { getYearsOfCall, getDueAmount } from "./constants";

const thisYear = new Date().getFullYear();

describe("getYearsOfCall", () => {
  it("returns 0 for missing or unparseable input", () => {
    expect(getYearsOfCall(null)).toBe(0);
    expect(getYearsOfCall(undefined)).toBe(0);
    expect(getYearsOfCall("")).toBe(0);
    expect(getYearsOfCall("not a year")).toBe(0);
  });

  it("computes years since call", () => {
    expect(getYearsOfCall(String(thisYear))).toBe(0);
    expect(getYearsOfCall(String(thisYear - 8))).toBe(8);
    expect(getYearsOfCall(String(thisYear - 20))).toBe(20);
  });

  it("never returns negative for future years", () => {
    expect(getYearsOfCall(String(thisYear + 3))).toBe(0);
  });
});

describe("getDueAmount", () => {
  const tiered = {
    is_tiered: true,
    amount_0_4: 1000, amount_5_9: 2000, amount_10_14: 3000, amount_15_plus: 4000,
    amount_san: 5000, flat_amount: null,
  };
  const flat = {
    is_tiered: false,
    amount_0_4: null, amount_5_9: null, amount_10_14: null, amount_15_plus: null,
    amount_san: null, flat_amount: 7500,
  };

  it("returns the flat amount for non-tiered items", () => {
    expect(getDueAmount(flat, String(thisYear - 12))).toBe(7500);
    expect(getDueAmount(flat, null)).toBe(7500);
  });

  it("selects the tier from years of call", () => {
    expect(getDueAmount(tiered, String(thisYear - 2))).toBe(1000);   // 0–4
    expect(getDueAmount(tiered, String(thisYear - 5))).toBe(2000);   // 5–9
    expect(getDueAmount(tiered, String(thisYear - 9))).toBe(2000);   // 5–9 upper bound
    expect(getDueAmount(tiered, String(thisYear - 10))).toBe(3000);  // 10–14
    expect(getDueAmount(tiered, String(thisYear - 15))).toBe(4000);  // 15+
    expect(getDueAmount(tiered, String(thisYear - 40))).toBe(4000);  // 15+
  });

  it("falls back to the lowest tier when year of call is unknown", () => {
    expect(getDueAmount(tiered, null)).toBe(1000);
  });

  it("charges SANs and Benchers the SAN amount when set", () => {
    expect(getDueAmount(tiered, String(thisYear - 2), "san")).toBe(5000);
    expect(getDueAmount(tiered, String(thisYear - 30), "bencher")).toBe(5000);
  });

  it("falls back to tier for SANs when no SAN amount is set", () => {
    const noSan = { ...tiered, amount_san: null };
    expect(getDueAmount(noSan, String(thisYear - 30), "san")).toBe(4000);
  });

  it("ignores rank for regular members", () => {
    expect(getDueAmount(tiered, String(thisYear - 2), "regular")).toBe(1000);
  });
});
