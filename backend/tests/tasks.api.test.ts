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

const JWT_SECRET = "session-3-test-secret";

class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = [
    {
      id: 1,
      text: "Private task",
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
      this.tasks.find(
        (task) =>
          task.id === id &&
          task.userId === userId,
      ) ?? null
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

describe("Tasks API", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("rejects a task whose text contains only spaces", async () => {
    const app = createTestApp(new InMemoryTaskRepository());

    const response = await request(app)
      .post("/tasks")
      .set("Authorization", authorizationFor(1))
      .send({ text: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Text is required" });
  });

});
