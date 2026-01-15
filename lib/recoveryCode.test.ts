import { describe, it, expect } from "vitest";
import { generateRecoveryCode, isValidRecoveryCode, formatRecoveryCode } from "./recoveryCode";

describe("generateRecoveryCode", () => {
  it("should generate a code in the correct format", () => {
    const code = generateRecoveryCode();
    expect(isValidRecoveryCode(code)).toBe(true);
  });

  it("should generate unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateRecoveryCode());
    }
    // With ~33 bits of entropy, 100 codes should be unique
    expect(codes.size).toBe(100);
  });

  it("should follow WORD-1234-WORD-5678 pattern", () => {
    const code = generateRecoveryCode();
    const parts = code.split("-");

    expect(parts).toHaveLength(4);
    expect(parts[0]).toMatch(/^[A-Z]{4,5}$/);
    expect(parts[1]).toMatch(/^\d{4}$/);
    expect(parts[2]).toMatch(/^[A-Z]{4,5}$/);
    expect(parts[3]).toMatch(/^\d{4}$/);
  });

  it("should generate 4-digit numbers between 1000-9999", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRecoveryCode();
      const parts = code.split("-");

      const num1 = parseInt(parts[1]);
      const num2 = parseInt(parts[3]);

      expect(num1).toBeGreaterThanOrEqual(1000);
      expect(num1).toBeLessThan(10000);
      expect(num2).toBeGreaterThanOrEqual(1000);
      expect(num2).toBeLessThan(10000);
    }
  });
});

describe("isValidRecoveryCode", () => {
  it("should return true for valid codes", () => {
    expect(isValidRecoveryCode("BEER-1234-WINE-5678")).toBe(true);
    expect(isValidRecoveryCode("LAGER-9999-STOUT-1000")).toBe(true);
    expect(isValidRecoveryCode("GOLD-5555-AMBER-7777")).toBe(true);
  });

  it("should return true for lowercase input (case insensitive)", () => {
    expect(isValidRecoveryCode("beer-1234-wine-5678")).toBe(true);
    expect(isValidRecoveryCode("Beer-1234-Wine-5678")).toBe(true);
  });

  it("should handle whitespace", () => {
    expect(isValidRecoveryCode("  BEER-1234-WINE-5678  ")).toBe(true);
  });

  it("should return false for invalid codes", () => {
    expect(isValidRecoveryCode("")).toBe(false);
    expect(isValidRecoveryCode("BEER")).toBe(false);
    expect(isValidRecoveryCode("BEER-1234")).toBe(false);
    expect(isValidRecoveryCode("BEER-1234-WINE")).toBe(false);
    expect(isValidRecoveryCode("BEER-123-WINE-5678")).toBe(false); // 3-digit number
    expect(isValidRecoveryCode("BEER-12345-WINE-5678")).toBe(false); // 5-digit number
    expect(isValidRecoveryCode("BE-1234-WINE-5678")).toBe(false); // 2-letter word
    expect(isValidRecoveryCode("BEERMAN-1234-WINE-5678")).toBe(false); // 7-letter word
  });

  it("should return false for null/undefined", () => {
    expect(isValidRecoveryCode(null as unknown as string)).toBe(false);
    expect(isValidRecoveryCode(undefined as unknown as string)).toBe(false);
  });
});

describe("formatRecoveryCode", () => {
  it("should convert to uppercase", () => {
    expect(formatRecoveryCode("beer-1234-wine-5678")).toBe("BEER-1234-WINE-5678");
  });

  it("should trim whitespace", () => {
    expect(formatRecoveryCode("  BEER-1234-WINE-5678  ")).toBe("BEER-1234-WINE-5678");
  });

  it("should handle mixed case", () => {
    expect(formatRecoveryCode("Beer-1234-Wine-5678")).toBe("BEER-1234-WINE-5678");
  });
});
