import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

function spawnNpmDev({ name, cwd }) {
  const child = spawn(npmCommand, ["run", "dev"], {
    cwd,
    stdio: "inherit",
    env: process.env,
    shell: isWindows,
    windowsHide: false,
  });

  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code !== 0) process.exitCode = code ?? 1;
  });

  child.on("error", (error) => {
    console.error(`[${name}] Failed to start:`, error);
    process.exitCode = 1;
  });

  return child;
}

const backend = spawnNpmDev({
  name: "backend",
  cwd: fileURLToPath(new URL("../backend/", import.meta.url)),
});
const frontend = spawnNpmDev({
  name: "frontend",
  cwd: fileURLToPath(new URL("../frontend/", import.meta.url)),
});

function shutdown(signal) {
  for (const child of [backend, frontend]) {
    if (!child.pid) continue;
    try {
      child.kill(signal);
    } catch {
      // ignore
    }
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
