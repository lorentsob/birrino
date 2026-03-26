import { beforeEach, describe, expect, it, vi } from "vitest";
import { addConsumptionRecord } from "./consumptionService";

const { getSessionMock, insertMock, fromMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  insertMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
    },
    from: fromMock,
  },
}));

describe("addConsumptionRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fromMock.mockReturnValue({
      insert: insertMock,
    });
  });

  it("should fail when there is no active session", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: null },
    });

    const result = await addConsumptionRecord({
      drinkId: "drink-1",
      quantity: 2,
      units: 3.3,
    });

    expect(result).toEqual({
      success: false,
      error: "Sessione utente non disponibile.",
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("should insert consumption with the current user id", async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          user: { id: "user-123" },
        },
      },
    });
    insertMock.mockResolvedValue({ error: null });

    const result = await addConsumptionRecord({
      drinkId: "drink-1",
      quantity: 2,
      units: 3.3,
      timestamp: "2026-03-26T12:00:00.000Z",
    });

    expect(fromMock).toHaveBeenCalledWith("consumption");
    expect(insertMock).toHaveBeenCalledWith({
      drink_id: "drink-1",
      quantity: 2,
      units: 3.3,
      timestamp: "2026-03-26T12:00:00.000Z",
      user_id: "user-123",
    });
    expect(result).toEqual({
      success: true,
      error: null,
    });
  });

  it("should surface database errors", async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          user: { id: "user-123" },
        },
      },
    });
    insertMock.mockResolvedValue({
      error: { message: "insert failed" },
    });

    const result = await addConsumptionRecord({
      drinkId: "drink-1",
      quantity: 1,
      units: 1.65,
      timestamp: "2026-03-26T12:00:00.000Z",
    });

    expect(result).toEqual({
      success: false,
      error: "insert failed",
    });
  });
});
