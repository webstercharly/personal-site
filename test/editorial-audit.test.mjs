import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const auditScript = new URL('../scripts/editorial-audit.mjs', import.meta.url);

test('editorial audit parses every post successfully', () => {
  const result = spawnSync(process.execPath, [auditScript.pathname, '--all', '--strict'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /\*\*Status: OK\*\*/);
});
