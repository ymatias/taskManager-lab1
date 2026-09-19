require("dotenv/config");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Infrastructure — database adapters
import { PrismaTaskRepository } from "./infrastructure/database/prisma-task.repository";
import { PrismaUserRepository } from "./infrastructure/database/prisma-user.repository";

// Application — task use cases
import { GetTasksUseCase } from "./application/task/get-tasks.use-case";
import { CreateTaskUseCase } from "./application/task/create-task.use-case";
import { UpdateTaskUseCase } from "./application/task/update-task.use-case";
import { DeleteTaskUseCase } from "./application/task/delete-task.use-case";

// Application — auth use cases
import { LoginUseCase } from "./application/auth/login.use-case";
import { GetProfileUseCase } from "./application/auth/get-profile.use-case";
import { RegisterUseCase } from "./application/auth/register.use-case";

// Infrastructure — HTTP routers
import { createTaskRouter } from "./infrastructure/http/task.router";
import { createAuthRouter } from "./infrastructure/http/auth.router";

// ── Composition Root ──────────────────────────────────────────────────────────

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const taskRepository = new PrismaTaskRepository(prisma);

// Auth use cases
const loginUseCase = new LoginUseCase(userRepository);
const getProfileUseCase = new GetProfileUseCase();
const registerUseCase = new RegisterUseCase(userRepository);

// Task use cases
const getTasksUseCase = new GetTasksUseCase(taskRepository);
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const updateTaskUseCase = new UpdateTaskUseCase(taskRepository);
const deleteTaskUseCase = new DeleteTaskUseCase(taskRepository);

// HTTP layer
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: any, res: any) => res.send("Backend is working!"));

// Healthcheck para Railway (Sesion 7)
app.get("/health", (_req: any, res: any) => res.status(200).json({ status: "ok" }));

// Swagger UI — available at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req: any, res: any) => res.json(swaggerSpec));

// Auth routes: POST /login, POST /register, GET /profile
app.use("/", createAuthRouter(loginUseCase, getProfileUseCase, registerUseCase));

// Task routes: GET|POST /tasks, PUT|DELETE /tasks/:id
app.use(
  "/tasks",
  createTaskRouter(
    getTasksUseCase,
    createTaskUseCase,
    updateTaskUseCase,
    deleteTaskUseCase
  )
);

// Local dev server — Vercel uses the exported app instead
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
