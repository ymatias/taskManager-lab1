import { describe, expect, it } from "vitest";
import { countPendingTasks, isValidEmail } from "./validations";

describe("isValidEmail", () => {
  it("accepts a valid email address", () => {
    // Arrange
    const email = "ana@example.com";

    // Act
    const result = isValidEmail(email);

    // Assert
    expect(result).toBe(true);
  });

  it("rejects an address without an at sign", () => {
    expect(isValidEmail("ana-example.com")).toBe(false);
  });

  it("rejects an address without a domain suffix", () => {
    expect(isValidEmail("ana@example")).toBe(false);
  });
});

describe("countPendingTasks", () => {
  it("counts only incomplete tasks", () => {
    const tasks = [
      { completed: true },
      { completed: false },
      { completed: false },
    ];

    expect(countPendingTasks(tasks)).toBe(2);
  });

  it("returns zero for an empty list", () => {
    expect(countPendingTasks([])).toBe(0);
  });
});
