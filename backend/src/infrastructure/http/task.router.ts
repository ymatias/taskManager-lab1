const express = require("express");
import { GetTasksUseCase } from "../../application/task/get-tasks.use-case";
import { CreateTaskUseCase } from "../../application/task/create-task.use-case";
import { UpdateTaskUseCase } from "../../application/task/update-task.use-case";
import { DeleteTaskUseCase } from "../../application/task/delete-task.use-case";
import { requireAuth } from "./auth.middleware";

export function createTaskRouter(
  getTasksUseCase: GetTasksUseCase,
  createTaskUseCase: CreateTaskUseCase,
  updateTaskUseCase: UpdateTaskUseCase,
  deleteTaskUseCase: DeleteTaskUseCase
) {
  const router = express.Router();

  // All task routes require authentication
  router.use(requireAuth);

  // GET /tasks
  router.get("/", async (req: any, res: any) => {
    try {
      const tasks = await getTasksUseCase.execute(req.userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /tasks
  router.post("/", async (req: any, res: any) => {
    try {
      const { text } = req.body;
      const task = await createTaskUseCase.execute(text, req.userId);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // PUT /tasks/:id
  router.put("/:id", async (req: any, res: any) => {
    try {
      const id = Number(req.params.id);
      const { text, completed } = req.body;
      const task = await updateTaskUseCase.execute(
        id,
        { text, completed },
        req.userId,
      );
      res.json(task);
    } catch (error: any) {
      const status = error.message === "Task not found" ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  });

  // DELETE /tasks/:id
  router.delete("/:id", async (req: any, res: any) => {
    try {
      const id = Number(req.params.id);
      await deleteTaskUseCase.execute(id, req.userId);
      res.json({ message: "Task deleted" });
    } catch (error: any) {
      const status = error.message === "Task not found" ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  });

  return router;
}
