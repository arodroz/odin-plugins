#!/usr/bin/env node
'use strict';
// PostToolUse launcher for `odin hook`.
//
// Usage (hooks.json): node "${CLAUDE_PLUGIN_ROOT}/hooks/odin-hook.js" <engine>
//   <engine> is "odin" (the binary on PATH, for development) or an npm spec such
//   as "@arodroz/odin@1.27.0" (the released plugin).
//
// The hook fires on every Edit/Write, so it must be cheap. Non-.odin edits are
// dismissed here in Node, without starting the engine. For .odin edits, the
// engine binary is resolved once through `npx <spec>` and its path cached per
// spec, so later edits run the binary directly instead of paying npm's ~1.5 s
// startup each time.
//
// Like `odin hook` itself, this never disrupts an edit: every failure is
// swallowed and the process always exits 0.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// isOdinEdit mirrors `odin hook`'s own filter: tool_input.file_path with a
// .odin extension, compared case-insensitively.
function isOdinEdit(raw) {
  try {
    const p = JSON.parse(raw).tool_input.file_path;
    return typeof p === 'string' && path.extname(p).toLowerCase() === '.odin';
  } catch {
    return false;
  }
}

// engineBinary returns the binary to run for spec, resolving through npx only
// when the cached path is missing or no longer exists.
function engineBinary(spec, deps) {
  if (spec === 'odin') return 'odin';
  const cache = deps.cacheFile(spec);
  try {
    const cached = deps.readFile(cache).trim();
    if (cached && deps.exists(cached)) return cached;
  } catch {
    // No cache yet.
  }
  const resolved = deps.printPath(spec).trim();
  try {
    deps.writeFile(cache, resolved);
  } catch {
    // Caching is an optimisation; a read-only temp dir only costs speed.
  }
  return resolved;
}

const realDeps = {
  cacheFile: (spec) => path.join(os.tmpdir(), 'arodroz-odin', spec.replace(/[^A-Za-z0-9.-]/g, '_') + '.path'),
  readFile: (p) => fs.readFileSync(p, 'utf8'),
  writeFile: (p, s) => {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, s);
  },
  exists: (p) => fs.existsSync(p),
  printPath: (spec) => {
    const r = spawnSync('npx', ['-y', spec], {
      env: { ...process.env, ANTERAS_ODIN_PRINT_PATH: '1' },
      encoding: 'utf8',
      shell: process.platform === 'win32', // npx is npx.cmd there
    });
    if (r.status !== 0) throw new Error(r.stderr || 'npx failed');
    return r.stdout;
  },
};

function main() {
  const spec = process.argv[2] || 'odin';
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf8');
  } catch {
    return;
  }
  if (!isOdinEdit(input)) return;
  let bin;
  try {
    bin = engineBinary(spec, realDeps);
  } catch {
    return;
  }
  spawnSync(bin, ['hook'], { input, stdio: ['pipe', 'inherit', 'inherit'] });
}

if (require.main === module) {
  main();
  process.exit(0);
}

module.exports = { isOdinEdit, engineBinary };
