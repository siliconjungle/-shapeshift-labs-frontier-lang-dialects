import assert from 'node:assert/strict';
import {
  attachUniversalDialectRegistry,
  createUniversalDialectRecord,
  createUniversalDialectRegistry,
  createUniversalExternRecord,
  normalizeDialectProjection,
  projectionDispositionReadiness,
  summarizeUniversalDialectRegistry,
  UniversalDialectConstructKinds
} from '../dist/index.js';

assert.equal(UniversalDialectConstructKinds.includes('macro'), true);
assert.equal(UniversalDialectConstructKinds.includes('runtime'), true);
assert.equal(projectionDispositionReadiness('lossy'), 'ready-with-losses');
assert.equal(projectionDispositionReadiness('unsupported'), 'blocked');
assert.deepEqual(normalizeDialectProjection({ target: 'typescript' }).targets, ['typescript']);

const macroRecord = createUniversalDialectRecord({
  language: 'rust',
  dialect: 'rust.macro_rules',
  constructKind: 'macro',
  name: 'route!',
  nativeAstNodeId: 'native_rust_macro_route',
  lossIds: ['loss_rust_macro_hygiene'],
  evidenceIds: ['evidence_rust_macro_expansion'],
  projection: {
    disposition: 'review-required',
    targets: ['typescript'],
    sourceMapId: 'source_map_route_macro',
    lossIds: ['loss_rust_macro_hygiene'],
    evidenceIds: ['evidence_rust_macro_expansion']
  }
});
assert.equal(macroRecord.id, 'dialect_rust_rust_macro_rules_macro_route');
assert.equal(macroRecord.projection.readiness, 'needs-review');

const externRecord = createUniversalExternRecord({
  language: 'javascript',
  dialect: 'node.runtime',
  externKind: 'runtimeBinding',
  name: 'process.env',
  nativeAstNodeId: 'native_node_process_env',
  binding: { module: 'node:process', symbol: 'env' },
  lossIds: ['loss_node_process_env'],
  evidenceIds: ['evidence_node_runtime_contract'],
  projection: {
    disposition: 'runtime-required',
    targets: ['browser'],
    lossIds: ['loss_node_process_env'],
    evidenceIds: ['evidence_node_runtime_contract']
  }
});
assert.equal(externRecord.id, 'extern_javascript_node_runtime_runtimebinding_process_env');
assert.equal(externRecord.projection.readiness, 'needs-review');

const registry = createUniversalDialectRegistry({
  id: 'dialect_registry_smoke',
  language: 'mixed',
  dialects: [macroRecord, macroRecord],
  externs: [externRecord, externRecord]
});
const summary = summarizeUniversalDialectRegistry(registry);
assert.equal(summary.records, 2);
assert.equal(summary.constructKinds.macro, 1);
assert.equal(summary.externKinds.runtimeBinding, 1);
assert.equal(summary.lossIds.includes('loss_rust_macro_hygiene'), true);
assert.equal(summary.sourceMapIds.includes('source_map_route_macro'), true);
assert.equal(summary.projectionReadiness, 'needs-review');

const universalAst = {
  kind: 'frontier.lang.universalAst',
  version: 1,
  id: 'universal_ast_smoke',
  metadata: { sourceLanguage: 'mixed', sourcePath: 'fixtures/dialect.frontier' },
  layers: {},
  semanticIndex: { id: 'semantic_index_smoke' }
};
const attached = attachUniversalDialectRegistry(universalAst, registry);
assert.equal(attached.metadata.dialects.summary.records, 2);
assert.equal(attached.metadata.language.externs[0].id, externRecord.id);
assert.equal(attached.layers.dialects.layer, 'dialects');
assert.equal(attached.layers.dialects.semanticIndexId, 'semantic_index_smoke');
assert.equal(attached.layers.dialects.nativeAstNodeIds.includes('native_rust_macro_route'), true);
assert.equal(attached.layers.dialects.references.some((reference) => reference.kind === 'sourceMap' && reference.id === 'source_map_route_macro'), true);
assert.equal(attached.layers.dialects.metadata.note.includes('generic stubs'), true);

console.log('@shapeshift-labs/frontier-lang-dialects smoke ok');
