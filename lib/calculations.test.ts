import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateUnits, remainingUnits, minsUntilSober, getDateRange } from "./calculations";

describe("calculateUnits", () => {
  it("should calculate units correctly for a standard beer", () => {
    // 330ml beer at 5% ABV, 1 quantity
    const units = calculateUnits(330, 5, 1);
    expect(units).toBe(1.65);
  });

  it("should calculate units correctly for wine", () => {
    // 175ml wine at 12% ABV, 1 quantity
    const units = calculateUnits(175, 12, 1);
    expect(units).toBe(2.1);
  });

  it("should handle multiple quantities", () => {
    // 330ml beer at 5% ABV, 3 quantities
    const units = calculateUnits(330, 5, 3);
    expect(units).toBe(4.95);
  });

  it("should return 0 for 0 volume", () => {
    const units = calculateUnits(0, 5, 1);
    expect(units).toBe(0);
  });

  it("should return 0 for 0 ABV", () => {
    const units = calculateUnits(330, 0, 1);
    expect(units).toBe(0);
  });

  it("should return 0 for 0 quantity", () => {
    const units = calculateUnits(330, 5, 0);
    expect(units).toBe(0);
  });
});

describe("remainingUnits", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return full units if just consumed", () => {
    const now = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(now);

    const remaining = remainingUnits(2, now);
    expect(remaining).toBe(2);
  });

  it("should return reduced units after 1 hour", () => {
    const drankAt = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(new Date("2024-01-01T13:00:00")); // 1 hour later

    const remaining = remainingUnits(2, drankAt);
    expect(remaining).toBe(1);
  });

  it("should return 0 if enough time has passed", () => {
    const drankAt = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(new Date("2024-01-01T15:00:00")); // 3 hours later

    const remaining = remainingUnits(2, drankAt);
    expect(remaining).toBe(0);
  });

  it("should never return negative values", () => {
    const drankAt = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(new Date("2024-01-01T20:00:00")); // 8 hours later

    const remaining = remainingUnits(2, drankAt);
    expect(remaining).toBe(0);
  });
});

describe("minsUntilSober", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 0 if no consumptions", () => {
    const mins = minsUntilSober([]);
    expect(mins).toBe(0);
  });

  it("should calculate minutes for fresh consumption", () => {
    const now = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(now);

    const consumptions = [
      { units: 2, timestamp: now.toISOString() }
    ];

    const mins = minsUntilSober(consumptions);
    expect(mins).toBe(120); // 2 units * 60 mins/unit
  });

  it("should account for elapsed time", () => {
    const drankAt = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(new Date("2024-01-01T13:00:00")); // 1 hour later

    const consumptions = [
      { units: 2, timestamp: drankAt.toISOString() }
    ];

    const mins = minsUntilSober(consumptions);
    expect(mins).toBe(60); // 1 unit remaining * 60 mins/unit
  });

  it("should sum multiple consumptions", () => {
    const now = new Date("2024-01-01T12:00:00");
    vi.setSystemTime(now);

    const consumptions = [
      { units: 1, timestamp: now.toISOString() },
      { units: 1.5, timestamp: now.toISOString() }
    ];

    const mins = minsUntilSober(consumptions);
    expect(mins).toBe(150); // 2.5 units * 60 mins/unit
  });
});

describe("getDateRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return correct day range", () => {
    vi.setSystemTime(new Date("2024-01-15T14:30:00"));

    const { start, end } = getDateRange("day");

    // Start should be at midnight local time
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(end.getDate()).toBe(15);
  });

  it("should return correct week range", () => {
    vi.setSystemTime(new Date("2024-01-15T14:30:00"));

    const { start, end } = getDateRange("week");

    expect(start.getDate()).toBe(9); // 6 days before the 15th
    expect(end.getDate()).toBe(15);
  });

  it("should return correct evening range when in evening", () => {
    vi.setSystemTime(new Date("2024-01-15T20:30:00"));

    const { start } = getDateRange("evening");

    expect(start.getHours()).toBe(18);
    expect(start.getDate()).toBe(15);
  });

  it("should return previous evening range when before 6pm", () => {
    vi.setSystemTime(new Date("2024-01-15T14:30:00"));

    const { start } = getDateRange("evening");

    expect(start.getHours()).toBe(18);
    expect(start.getDate()).toBe(14); // Previous day
  });
});
