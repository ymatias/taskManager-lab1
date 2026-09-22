import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createHealthRouter } from "../src/infrastructure/http/health.router";

const { version } = require("../package.json");

function buildApp(startedAt?: number) {
  const app = express();
  app.use("/health", createHealthRouter(startedAt));
  return app;
}

describe("GET /health", () => {
  const originalEnv = process.env.RAILWAY_ENVIRONMENT_NAME;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.RAILWAY_ENVIRONMENT_NAME;
    else process.env.RAILWAY_ENVIRONMENT_NAME = originalEnv;
  });

  it("responde 200 con estado, version y uptime", async () => {
    const res = await request(buildApp(Date.now() - 5_000)).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBe(version);
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(5);
  });

  it("informa el ambiente de Railway cuando esta definido", async () => {
    process.env.RAILWAY_ENVIRONMENT_NAME = "staging";

    const res = await request(buildApp()).get("/health");

    expect(res.body.environment).toBe("staging");
  });
});
