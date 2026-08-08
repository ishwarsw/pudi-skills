#!/usr/bin/env node
// Runs every case in cases.jsonl against the real hook scripts and checks the
// exit code. The plugins' whole claim is "exit 2 is not probabilistic" — that
// claim is worth nothing untested, and every defect this suite was born from
// was a hook silently passing something it was written to block.

const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const scripts = {
  guardrails: join(root, "guardrails", "scripts", "policy-check.js"),
  scanner: join(root, "scanner", "scripts", "report-check.js"),
  devops: join(root, "devops", "scripts", "yaml-check.js"),
};

const cases = readFileSync(join(__dirname, "cases.jsonl"), "utf8")
  .split("\n")
  .filter((line) => line.trim() && !line.trim().startsWith("//"))
  .map((line) => JSON.parse(line));

const failures = [];
for (const testCase of cases) {
  const toolInput = { file_path: testCase.path };
  if (testCase.old === undefined) {
    toolInput.content = testCase.content;
  } else {
    toolInput.old_string = testCase.old;
    toolInput.new_string = testCase.new;
  }
  const payload = JSON.stringify({
    tool_name: testCase.old === undefined ? "Write" : "Edit",
    tool_input: toolInput,
  });

  let exitCode = 0;
  try {
    execFileSync("node", [scripts[testCase.hook]], { input: payload, stdio: "pipe" });
  } catch (error) {
    exitCode = error.status;
  }

  const expected = testCase.expect === "block" ? 2 : 0;
  const passed = exitCode === expected;
  if (!passed) failures.push({ testCase, exitCode, expected });
  process.stdout.write(
    `${passed ? "ok  " : "FAIL"} [${testCase.hook}] ${testCase.why}\n`
  );
}

process.stdout.write(`\n${cases.length - failures.length}/${cases.length} passed\n`);
for (const failure of failures) {
  process.stdout.write(
    `  FAIL ${failure.testCase.why}\n` +
      `       path=${failure.testCase.path} expected exit ${failure.expected}, got ${failure.exitCode}\n`
  );
}
process.exit(failures.length === 0 ? 0 : 1);
