import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TaskCard from "./TaskCard";

// Sesion 8 (punto pendiente #2 del reporte): TaskCard no tenia pruebas propias.

describe("TaskCard", () => {
  const baseTask = { id: 7, text: "Comprar pan", completed: false };

  it("muestra el texto de la tarea", () => {
    render(
      <TaskCard task={baseTask} onDeleteTask={vi.fn()} onToggleTask={vi.fn()} />,
    );

    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
  });

  it("refleja el estado completado en el checkbox", () => {
    render(
      <TaskCard
        task={{ ...baseTask, completed: true }}
        onDeleteTask={vi.fn()}
        onToggleTask={vi.fn()}
      />,
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("llama a onToggleTask con el id al marcar el checkbox", async () => {
    const onToggleTask = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskCard task={baseTask} onDeleteTask={vi.fn()} onToggleTask={onToggleTask} />,
    );

    await user.click(screen.getByRole("checkbox"));

    expect(onToggleTask).toHaveBeenCalledOnce();
    expect(onToggleTask).toHaveBeenCalledWith(7);
  });

  it("llama a onDeleteTask con el id al presionar el boton de borrar", async () => {
    const onDeleteTask = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskCard task={baseTask} onDeleteTask={onDeleteTask} onToggleTask={vi.fn()} />,
    );

    await user.click(screen.getByRole("button"));

    expect(onDeleteTask).toHaveBeenCalledOnce();
    expect(onDeleteTask).toHaveBeenCalledWith(7);
  });
});
