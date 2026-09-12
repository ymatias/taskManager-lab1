export function isValidEmail(email: string): boolean {
  const normalized = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function countPendingTasks(
  tasks: ReadonlyArray<{ completed: boolean }>,
): number {
  return tasks.filter((task) => !task.completed).length;
}
