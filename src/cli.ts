#!/usr/bin/env node
import { run } from "./cli/run";

run(process.argv.slice(2), {
  stdin: process.stdin,
  stdinIsTTY: Boolean(process.stdin.isTTY),
  stdout: process.stdout,
  stderr: process.stderr,
}).then((code) => {
  process.exitCode = code;
});
