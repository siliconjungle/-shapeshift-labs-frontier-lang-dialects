import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const banned = [
  'frontier-lang-compiler',
  'frontier-lang-parser',
  'frontier-lang-cli'
];

for (const file of walk('src')) {
  const source = readFileSync(file, 'utf8');
  for (const token of banned) {
    if (source.includes(token)) {
      throw new Error(`Unexpected higher-layer dependency reference in ${file}: ${token}`);
    }
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) yield* walk(path);
    else if (/\.[cm]?[jt]s$|\.d\.ts$/.test(path)) yield path;
  }
}
