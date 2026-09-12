import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskInput from "./TaskInput";

describe("TaskInput", () => {
  it("submits the trimmed text entered by the user", async () => {
    // Arrange
    const onAddTask = vi.fn();
    const user = userEvent.setup();
    render(<TaskInput onAddTask={onAddTask} />);
    const input = screen.getByRole("textbox", { name: "Nueva tarea" });

    // Act
    await user.type(input, "  Comprar pan  ");
    await user.click(screen.getByRole("button", { name: /agregar/i }));

    // Assert
    expect(onAddTask).toHaveBeenCalledOnce();
    expect(onAddTask).toHaveBeenCalledWith("Comprar pan");
    expect(input).toHaveValue("");
  });

  it("does not submit a value containing only spaces", async () => {
    const onAddTask = vi.fn();
    const user = userEvent.setup();
    render(<TaskInput onAddTask={onAddTask} />);

    await user.type(
      screen.getByRole("textbox", { name: "Nueva tarea" }),
      "   ",
    );
    await user.click(screen.getByRole("button", { name: /agregar/i }));

    expect(onAddTask).not.toHaveBeenCalled();
  });
});
