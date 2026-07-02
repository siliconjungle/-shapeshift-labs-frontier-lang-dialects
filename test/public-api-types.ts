import {
  UniversalDialectConstructKinds,
  UniversalDialectProjectionDispositions,
  attachUniversalDialectRegistry,
  createUniversalDialectRecord,
  createUniversalDialectRegistry,
  createUniversalExternRecord,
  createUniversalDialectLayer,
  hasUniversalDialectRegistryInput,
  normalizeDialectProjection,
  projectionDispositionReadiness,
  summarizeUniversalDialectRegistry
} from '../src/index.js';
import { createDocument, createUniversalAstEnvelope } from '@shapeshift-labs/frontier-lang-kernel';
import type {
  FrontierUniversalAstWithDialects,
  UniversalDialectProjectionEvidence,
  UniversalDialectRecord,
  UniversalDialectRecordInput,
  UniversalDialectRegistry,
  UniversalDialectRegistryInput,
  UniversalExternRecord,
  UniversalExternRecordInput
} from '../src/index.js';

const dialectRecord: UniversalDialectRecord = createUniversalDialectRecord({
  language: 'rust',
  dialect: 'rust.macro_rules',
  constructKind: 'macro',
  name: 'route!'
} satisfies UniversalDialectRecordInput);

const externRecord: UniversalExternRecord = createUniversalExternRecord({
  language: 'javascript',
  dialect: 'node.runtime',
  externKind: 'runtimeBinding',
  name: 'process.env'
} satisfies UniversalExternRecordInput);

const registry: UniversalDialectRegistry = createUniversalDialectRegistry({
  dialects: [dialectRecord],
  externs: [externRecord]
} satisfies UniversalDialectRegistryInput);

const projection: UniversalDialectProjectionEvidence = normalizeDialectProjection({ disposition: 'preserved' });
const ast = createUniversalAstEnvelope({
  id: 'ast_types',
  document: createDocument({ id: 'doc_types', name: 'TypeProbe', nodes: [] }),
  layers: {},
  metadata: {}
});
const attached: FrontierUniversalAstWithDialects = attachUniversalDialectRegistry(ast, registry);
const layer = createUniversalDialectLayer(ast, registry);

UniversalDialectConstructKinds.includes('macro');
UniversalDialectProjectionDispositions.includes('preserved');
projectionDispositionReadiness(projection.disposition);
summarizeUniversalDialectRegistry(registry);
hasUniversalDialectRegistryInput({ universalDialectRegistry: registry });
void attached;
void layer;
