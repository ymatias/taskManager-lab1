# Informe del Laboratorio 03

## Objetivo y alcance

Este laboratorio implementa los tres niveles solicitados para la Sesión 3 sobre Task Manager: pruebas unitarias de funciones puras, pruebas de componente React y pruebas HTTP de la API. La suite se ejecuta localmente con un solo comando y forma parte del pipeline de GitHub Actions.

## Resultado

| Requisito | Implementación | Estado |
|---|---|---:|
| Vitest configurado | Configuraciones separadas para `app/` y `backend/` | Cumplido |
| Función pura | `isValidEmail` y `countPendingTasks` | Cumplido |
| Caso esperado y caso límite | Cinco pruebas unitarias | Cumplido |
| Interacción de componente | Escritura y envío mediante `userEvent` sobre `TaskInput` | Cumplido |
| Caso vacío del componente | Verifica que espacios en blanco no invocan el callback | Cumplido |
| Prueba de API | Tres pruebas con Supertest sobre el router real | Cumplido |
| Ciclo rojo a verde | Regresión de autorización reproducida y corregida | Cumplido |
| Suite con un comando | `npm test` desde la raíz | Cumplido |
| Pruebas en CI | Cada job ejecuta `npm test` antes del build | Cumplido |

## Laboratorio 1 — Pruebas unitarias

Se agregaron dos funciones puras en `app/src/utils/validations.ts`:

- `isValidEmail`, que valida una estructura mínima de correo electrónico.
- `countPendingTasks`, que cuenta tareas cuyo estado `completed` es falso.

El archivo `validations.test.ts` contiene cinco escenarios:

1. Acepta un correo válido.
2. Rechaza un correo sin arroba.
3. Rechaza un correo sin sufijo de dominio.
4. Cuenta únicamente las tareas pendientes.
5. Devuelve cero ante una lista vacía.

Las pruebas siguen Arrange, Act y Assert de forma explícita en el primer escenario y conservan la misma separación conceptual en los casos breves.

## Laboratorio 2 — Prueba de componente

`TaskInput.test.tsx` utiliza React Testing Library y `userEvent` para interactuar con el componente como lo haría un usuario:

- localiza el campo por su rol y nombre accesible;
- escribe un título con espacios exteriores;
- pulsa el botón Agregar;
- verifica que el callback recibe el texto normalizado;
- comprueba que el campo queda vacío;
- confirma que un valor formado solo por espacios no se envía.

Se añadió la etiqueta visible `Nueva tarea` al `TextField`. Además de permitir una consulta accesible en la prueba, mejora la relación entre etiqueta y campo para usuarios de tecnologías de asistencia.

## Laboratorio 3 — Cacería de bugs

### Ticket adaptado al proyecto

**Problema:** un usuario autenticado podía modificar o eliminar una tarea perteneciente a otro usuario si conocía su identificador.

**Causa:** `UpdateTaskUseCase` y `DeleteTaskUseCase` consultaban el repositorio solamente por `id`. Aunque las consultas de listado estaban filtradas por `userId`, las mutaciones no aplicaban ese límite.

### Evidencia roja

La prueba se agregó en el commit `c3bb5d9` y se ejecutó antes de cambiar el código de producción.

```text
FAIL  Tasks API > does not let a user update a task owned by another user
AssertionError: expected 200 to be 404
Test Files  1 failed
Tests       1 failed | 1 passed
```

La respuesta `200` confirmó que el usuario 2 podía actualizar la tarea 1, cuyo propietario era el usuario 1.

### Corrección

El commit `02bd4aa` propagó `userId` desde el middleware HTTP hacia los casos de uso y el puerto del repositorio. `PrismaTaskRepository` ahora combina `id` y `userId` al localizar, actualizar y eliminar una tarea.

Se añadió también un escenario equivalente para eliminación. Para no revelar la existencia de recursos ajenos, ambos casos responden `404 Task not found`.

### Evidencia verde

```text
Test Files  1 passed
Tests       3 passed
```

## Suite completa

Desde la raíz del repositorio:

```bash
npm test
```

Resultado local final:

```text
Frontend: 2 archivos, 7 pruebas aprobadas
Backend:  1 archivo, 3 pruebas aprobadas
Total:    3 archivos, 10 pruebas aprobadas
```

También se verificaron correctamente:

```bash
cd app
npm run lint
npm run build

cd ../backend
npm run lint
npm run build
```

## Integración continua

El workflow `.github/workflows/ci.yml` mantiene dos jobs independientes. En cada job el orden es:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`

Este orden detiene pronto los cambios incorrectos y evita construir código cuya suite no pasa.

## Evidencia de GitHub

- Rama: `feature/lab03-tests`
- Pull Request: pendiente de registrar después del primer push
- Ejecución de GitHub Actions: pendiente de registrar después del primer push
- Revisión del compañero: pendiente
