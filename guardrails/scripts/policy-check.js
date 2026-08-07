#!/usr/bin/env node
// PreToolUse hook for Write/Edit/NotebookEdit — mechanically enforces the
// rule 7 hard rules from skills/guardrails/SKILL.md regardless of whether the
// skill was triggered by description-matching. Exit 2 + stderr = block.

const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    process.exit(0);
  }

  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || "";
  const content = extractContent(input.tool_name, toolInput);

  if (!filePath || content == null) process.exit(0);

  const violations = [];
  const isCodeFile = /\.(py|js|jsx|ts|tsx|mjs|cjs)$/i.test(filePath);
  const isDependencyFile = /(requirements.*\.txt|pyproject\.toml|package\.json)$/i.test(filePath);

  if (isCodeFile) {
    checkLeadingUnderscore(content, violations);
    checkMainGuard(content, violations);
    checkDunderAll(content, violations);
  }
  if (isDependencyFile) {
    checkUnpinnedDependency(content, filePath, violations);
  }

  if (violations.length > 0) {
    process.stderr.write(
      "Guardrails rule 7 violation — blocked:\n" +
        violations.map((v) => "  - " + v).join("\n") +
        "\n"
    );
    process.exit(2);
  }
  process.exit(0);
});

function extractContent(toolName, toolInput) {
  if (toolName === "Write") return toolInput.content;
  if (toolName === "Edit") return addedLines(toolInput.old_string, toolInput.new_string);
  if (toolName === "NotebookEdit") return toolInput.new_source;
  return null;
}

// Rule 7 bans names you *create*, but an Edit's new_string carries untouched
// context lines too — only the genuinely added ones get checked.
function addedLines(oldString, newString) {
  if (typeof newString !== "string") return null;
  if (typeof oldString !== "string") return newString;
  const existing = new Set(oldString.split("\n").map((line) => line.trim()));
  return newString
    .split("\n")
    .filter((line) => !existing.has(line.trim()))
    .join("\n");
}

function checkLeadingUnderscore(content, violations) {
  const pattern =
    /\b(?:def|function|class|const|let|var)\s+(_[A-Za-z0-9_]*)\b|(?<![.\w])(_[A-Za-z][A-Za-z0-9_]*)\s*=(?!=)/g;
  const dunderAllowed = new Set(["__init__", "__name__", "__class__", "__main__", "__all__", "__file__", "__dict__", "__doc__"]);
  let match;
  const seen = new Set();
  while ((match = pattern.exec(content)) !== null) {
    const name = match[1] || match[2];
    if (!name || dunderAllowed.has(name)) continue;
    if (name.startsWith("__") && name.endsWith("__")) continue;
    if (!seen.has(name)) {
      seen.add(name);
      violations.push(`leading-underscore name created: "${name}" (guardrails rule 7 — no leading-underscore names)`);
    }
  }
}

function checkMainGuard(content, violations) {
  if (/^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m.test(content)) {
    violations.push('if __name__ == "__main__": block added (guardrails rule 7 — forbidden)');
  }
}

function checkDunderAll(content, violations) {
  if (/^\s*__all__\s*=/m.test(content)) {
    violations.push("__all__ = ... declaration added (guardrails rule 7 — forbidden)");
  }
}

function checkUnpinnedDependency(content, filePath, violations) {
  const lines = content.split("\n");
  const isPackageJson = /package\.json$/i.test(filePath);
  for (const line of lines) {
    if (isPackageJson) {
      const match = line.match(/"([A-Za-z0-9@/_.-]+)"\s*:\s*"([^"]+)"/);
      if (!match) continue;
      const version = match[2];
      if (/^[\^~]/.test(version) || version === "*" || version === "latest") {
        violations.push(`unpinned dependency "${match[1]}": "${version}" in package.json (guardrails rule 7 — pin exact versions)`);
      }
    } else {
      const match = line.match(/^([A-Za-z0-9_.-]+)\s*(>=|~=|\^)\s*[\w.]+/);
      if (match) {
        violations.push(`unpinned dependency "${match[1]}" using "${match[2]}" (guardrails rule 7 — pin exact versions)`);
      }
    }
  }
}
