import { createUniversalDialectRegistry } from '../dist/index.js';

const started = performance.now();
for (let index = 0; index < 1_000; index += 1) {
  createUniversalDialectRegistry({
    language: 'javascript',
    dialects: [{ dialect: 'node.runtime', constructKind: 'runtime', name: `binding${index}` }]
  });
}
const elapsedMs = performance.now() - started;
console.log(JSON.stringify({ package: '@shapeshift-labs/frontier-lang-dialects', records: 1000, elapsedMs }));
