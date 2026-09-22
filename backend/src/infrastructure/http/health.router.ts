const express = require("express");

// Version declarada en backend/package.json. La ruta relativa funciona tanto
// desde src/ (ts-node, vitest) como desde dist/ (build en Docker/Railway).
const { version } = require("../../../package.json");

/**
 * Healthcheck del servicio (Sesion 7) enriquecido para la verificacion final
 * (Sesion 8): ademas del estado, informa que version esta desplegada, en que
 * ambiente corre y hace cuanto arranco el proceso. Asi se puede confirmar desde
 * el navegador que un cambio llego a staging y que produccion sigue en la
 * version anterior hasta el despliegue manual.
 */
export function createHealthRouter(startedAt: number = Date.now()) {
  const router = express.Router();

  router.get("/", (_req: any, res: any) => {
    res.status(200).json({
      status: "ok",
      version,
      environment:
        process.env.RAILWAY_ENVIRONMENT_NAME ??
        process.env.NODE_ENV ??
        "development",
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    });
  });

  return router;
}
