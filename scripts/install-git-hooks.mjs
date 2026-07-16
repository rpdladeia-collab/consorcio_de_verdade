#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  execFileSync("git", ["rev-parse", "--git-dir"], {
    cwd: projectRoot,
    stdio: "ignore",
  });
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    cwd: projectRoot,
    stdio: "ignore",
  });
  console.log("Hooks Git de proteção configurados em .githooks.");
} catch {
  console.log("Hooks Git não configurados: este ambiente não contém os metadados do repositório.");
}
