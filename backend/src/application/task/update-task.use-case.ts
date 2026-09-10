import { ITaskRepository } from "../../domain/task.repository.port";
import { Task, UpdateTaskInput } from "../../domain/task.entity";

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(
    id: number,
    input: UpdateTaskInput,
    userId: number,
  ): Promise<Task> {
    const existing = await this.taskRepository.findById(id, userId);
    if (!existing) {
      throw new Error("Task not found");
    }
    return this.taskRepository.update(id, input, userId);
  }
}
