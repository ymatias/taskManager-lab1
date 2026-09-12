import { test, expect } from "@playwright/test";

// Flujo feliz completo: registrar una cuenta nueva (para no depender de datos
// sembrados), iniciar sesión automáticamente, crear una tarea y verla en la
// lista. Requiere que el backend real (Express + Postgres) esté corriendo —
// ver e2e/README.md / ci.yml para cómo se levanta en CI y en local.
test("un usuario puede registrarse, crear una tarea y verla en la lista", async ({
  page,
}) => {
  const uniqueEmail = `e2e-${Date.now()}@example.com`;

  // 1. Entrar a la aplicación y pasar a la pestaña de registro
  await page.goto("/");
  await page.getByRole("tab", { name: "Registrarse" }).click();

  // 2. Registrar una cuenta nueva (el LoginPage inicia sesión automáticamente
  //    después de un registro exitoso)
  await page.getByLabel("Nombre completo").fill("Usuario E2E");
  await page.getByLabel("Correo electronico").fill(uniqueEmail);
  await page.getByLabel("Contrasena").fill("Passw0rd!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  // 3. Confirmar que la sesión inició (aparece el formulario de tareas)
  await expect(page.getByLabel("Nueva tarea")).toBeVisible({
    timeout: 15_000,
  });

  // 4. Crear una tarea
  await page.getByLabel("Nueva tarea").fill("Comprar pan");
  await page.getByRole("button", { name: "Agregar" }).click();

  // 5. Verla en la lista
  await expect(page.getByText("Comprar pan")).toBeVisible();
});
