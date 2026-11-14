import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { loadBindings, transformSync } from "next/dist/build/swc/index.js";

await loadBindings();

export function loadComponent(url, mocks) {
  const filename = fileURLToPath(url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename,
    jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  const require = createRequire(url);
  runInThisContext(`(function(module, exports, require) { ${code}\n})`, { filename })(
    module, module.exports, (id) => Object.hasOwn(mocks, id) ? { __esModule: true, ...mocks[id] } : require(id),
  );
  return module.exports;
}
