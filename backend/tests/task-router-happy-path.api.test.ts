import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { CreateTaskUseCase } from "../src/application/task/create-task.use-case";
import { DeleteTaskUseCase } from "../src/application/task/delete-task.use-case";
import { GetTasksUseCase } from "../src/application/task/get-tasks.use-case";
import { UpdateTaskUseCase } from "../src/application/task/update-task.use-case";
import type { ITaskRepository } from "../src/domain/task.repository.port";
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from "../src/domain/task.entity";
import { createTaskRouter } from "../src/infrastructure/http/task.router";

// Sesion 8 (punto pendiente #2 del reporte): estos casos no estaban cubiertos
// antes -- las pruebas existentes solo verificaban los caminos de error (texto
// vacio, tarea de otro usuario). Aqui se agregan los caminos exitosos de las 4
// operaciones y los 3 casos de rechazo del middleware de autenticacion.

const JWT_SECRET = "session-8-test-secret";

class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = [
    {
      id: 1,
      text: "Tarea existente",
      completed: false,
      userId: 1,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  ];

  async findAll(userId: number): Promise<Task[]> {
    return this.tasks.filter((task) => task.userId === userId);
  }

  async findById(id: number, userId: number): Promise<Task | null> {
    return (
      this.tasks.find((task) => task.id === id && task.userId === userId) ??
      null
    );
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: this.tasks.length + 1,
      text: input.text,
      completed: false,
      userId: input.userId,
      createdAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async update(
    id: number,
    input: UpdateTaskInput,
    userId: number,
  ): Promise<Task> {
    const task = await this.findById(id, userId);
    if (!task) throw new Error("Task not found");
    Object.assign(task, input);
    return task;
  }

  async delete(id: number, userId: number): Promise<void> {
    const task = await this.findById(id, userId);
    if (!task) throw new Error("Task not found");
    this.tasks = this.tasks.filter((candidate) => candidate.id !== id);
  }
}

function createTestApp(repository: ITaskRepository) {
  const app = express();
  app.use(express.json());
  app.use(
    "/tasks",
    createTaskRouter(
      new GetTasksUseCase(repository),
      new CreateTaskUseCase(repository),
      new UpdateTaskUseCase(repository),
      new DeleteTaskUseCase(repository),
    ),
  );
  return app;
}

function authorizationFor(userId: number): string {
  return `Bearer ${jwt.sign({ userId }, JWT_SECRET)}`;
}

describe("Middleware de autenticacion en /tasks", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("rechaza la peticion si no se envia el header Authorization", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app).get("/tasks");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No token provided" });
  });

  it("rechaza un header Authorization sin token", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app)
      .get("/tasks")
      .set("Authorization", "Bearer");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Malformed authorization header",
    });
  });

  it("rechaza un token invalido o expirado", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app)
      .get("/tasks")
      .set("Authorization", "Bearer token-que-no-existe");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid or expired token" });
  });
});

describe("Caminos exitosos de /tasks", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("devuelve solo las tareas del usuario autenticado", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app)
      .get("/tasks")
      .set("Authorization", authorizationFor(1));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ text: "Tarea existente" });
  });

  it("crea una tarea nueva para el usuario autenticado", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app)
      .post("/tasks")
      .set("Authorization", authorizationFor(1))
      .send({ text: "Nueva tarea de la prueba" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      text: "Nueva tarea de la prueba",
      completed: false,
      userId: 1,
    });
  });

  it("actualiza una tarea propia del usuario autenticado", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app)
      .put("/tasks/1")
      .set("Authorization", authorizationFor(1))
      .send({ completed: true });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 1, completed: true });
  });

  it("elimina una tarea propia del usuario autenticado", async () => {
    const repository = new InMemoryTaskRepository();
    const app = createTestApp(repository);

    const response = await request(app)
      .delete("/tasks/1")
      .set("Authorization", authorizationFor(1));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Task deleted" });
    expect(await repository.findAll(1)).toHaveLength(0);
  });
});
