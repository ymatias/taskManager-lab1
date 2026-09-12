import { ITaskRepository } from "../../domain/task.repository.port";
import { Task, CreateTaskInput, UpdateTaskInput } from "../../domain/task.entity";

export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: any) {}

  async findAll(userId: number): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { userId } });
  }

  async findById(id: number, userId: number): Promise<Task | null> {
    return this.prisma.task.findFirst({ where: { id, userId } });
  }

  async create(input: CreateTaskInput): Promise<Task> {
    return this.prisma.task.create({
      data: { text: input.text, userId: input.userId },
    });
  }

  async update(
    id: number,
    input: UpdateTaskInput,
    userId: number,
  ): Promise<Task> {
    return this.prisma.task.update({
      where: { id, userId },
      data: {
        ...(input.text !== undefined && { text: input.text }),
        ...(input.completed !== undefined && { completed: input.completed }),
      },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.prisma.task.delete({ where: { id, userId } });
  }
}
