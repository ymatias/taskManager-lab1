# Informe de laboratorios — Sesión 2

## Repositorio

- Repositorio: `ymatias/taskManager-lab1`
- Rama de trabajo: `feature/ci-pipeline`
- Aplicaciones: frontend en `app/` y API en `backend/`

## Laboratorio 1 — Primer pipeline de CI

Se creó `.github/workflows/ci.yml` con dos jobs independientes:

1. **Frontend - Lint & Build**: ejecuta `npm ci`, `npm run lint` y `npm run build` dentro de `app/`.
2. **Backend - Lint & Build**: ejecuta `npm ci`, `npm run lint` y `npm run build` dentro de `backend/`.

El workflow se ejecuta en pushes a `main` y en Pull Requests dirigidos a `main`. También limita los permisos del token a lectura del contenido y cancela ejecuciones anteriores de la misma rama cuando son reemplazadas.

Como el proyecto no tenía lint configurado, se agregó ESLint para TypeScript en ambos paquetes, junto con el script `npm run lint`.

## Laboratorio 2 — Simulacro de incidente

Pendiente de ejecución después de integrar el primer workflow en `main`. La evidencia requerida será:

- URL del Pull Request del incidente: _pendiente_
- Ejecución roja: _pendiente_
- Diagnóstico (archivo, línea y causa): _pendiente_
- Commit de corrección: _pendiente_
- Ejecución verde: _pendiente_
- Revisor/compañero: _pendiente_

Durante la preparación local se obtuvo y corrigió un fallo inicial de lint: ESLint marcó los `require()` del backend como incompatibles con su recomendación para módulos ES. El diagnóstico mostró 16 errores `@typescript-eslint/no-require-imports`; se ajustó la configuración para reconocer que el backend declara `"type": "commonjs"`. Esta comprobación local no sustituye el ciclo rojo → verde alojado que exige el laboratorio.

## Laboratorio 3 — Badge de CI

Se reemplazó `<!-- BADGE_CI -->` en el README por el badge del workflow `ci.yml`, apuntando a la rama `main` del repositorio propio.

El badge mostrará el estado definitivo después de que el workflow sea integrado y ejecutado en `main`.

## Verificación local

| Componente | `npm ci` | `npm run lint` | `npm run build` |
|---|---:|---:|---:|
| Frontend (`app/`) | Aprobado | Aprobado | Aprobado |
| Backend (`backend/`) | Aprobado | Aprobado | Aprobado |

La auditoría de dependencias reportó 3 vulnerabilidades altas en el árbol de desarrollo del frontend y 12 vulnerabilidades transitivas en el backend (5 moderadas y 7 altas). No se aplicó `npm audit fix --force` porque las correcciones propuestas incluyen cambios mayores o regresiones de Prisma y quedan fuera del alcance de este laboratorio.

## Evidencia alojada pendiente

La validación final debe completarse con las URLs de GitHub Actions y la revisión de un compañero. Estas evidencias dependen de que el Pull Request sea creado, revisado e integrado en GitHub.
