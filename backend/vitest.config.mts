import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts", // composition root — wiring only, exercised by e2e, not unit tests
        "src/swagger.ts", // static OpenAPI spec definition
        "src/infrastructure/database/**", // thin Prisma adapters, covered indirectly via e2e against a real DB
      ],
      // Umbral calibrado a la cobertura real actual (application + http):
      // application/auth (login/register) hoy tiene 0% — ver docs/lab04
      // para el hallazgo honesto de Laboratorio 2 y el plan de subir esto.
      thresholds: {
        lines: 30,
        functions: 40,
        branches: 15,
        statements: 30,
      },
    },
  },
});
