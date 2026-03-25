import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

test("login page presents generic sign-in copy with magic link before Google login", () => {
  const source = readFileSync(
    path.resolve(process.cwd(), "src/app/[locale]/login/page.tsx"),
    "utf8",
  );

  assert.match(source, /eyebrow="Login to UGC Hits"/);
  assert.match(source, /title="Sign in"/);
  assert.match(source, /Magic link sent\. Check your inbox\./);
  assert.match(source, /<h2 className="text-xl font-semibold text-slate-950">\s*Magic link\s*<\/h2>/);
  assert.match(source, /Send a sign-in link to email\./);
  assert.match(source, /<h2 className="text-xl font-semibold text-slate-950">\s*Google login\s*<\/h2>/);

  const magicLinkIndex = source.indexOf(
    '<h2 className="text-xl font-semibold text-slate-950">Magic link</h2>',
  );
  const googleLoginIndex = source.indexOf(
    '<h2 className="text-xl font-semibold text-slate-950">Google login</h2>',
  );

  assert.notEqual(magicLinkIndex, -1);
  assert.notEqual(googleLoginIndex, -1);
  assert.ok(magicLinkIndex < googleLoginIndex);
});
