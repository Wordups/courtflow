import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

function collect(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? collect(path) : path.endsWith('.js') ? [path] : [];
  });
}

for (const file of collect(resolve('apps'))) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
