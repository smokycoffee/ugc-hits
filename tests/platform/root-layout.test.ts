import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

test("app root layout exists with html and body tags", () => {
  const source = readFileSync(
    path.resolve(process.cwd(), "src/app/layout.tsx"),
    "utf8",
  );

  assert.match(source, /<html/);
  assert.match(source, /<body/);
});
