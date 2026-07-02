export const UniversalDialectConstructKinds = Object.freeze([
  'macro',
  'reflection',
  'generator',
  'runtime',
  'extern',
  'attribute',
  'decorator',
  'preprocessor',
  'conditionalCompilation',
  'syntaxExtension',
  'toolchain'
]);

export const UniversalDialectProjectionDispositions = Object.freeze([
  'preserved',
  'lossless',
  'lossy',
  'opaque',
  'declaration-only',
  'stub-only',
  'unsupported',
  'runtime-required',
  'review-required'
]);

export function createUniversalDialectRecord(input = {}, context = {}) {
  const language = normalizeOptionalString(input.language ?? context.language);
  const dialect = normalizeOptionalString(input.dialect ?? context.dialect ?? language ?? 'unknown');
  const constructKind = normalizeOptionalString(input.constructKind ?? context.constructKind ?? 'extern');
  const name = normalizeOptionalString(input.name ?? input.symbol ?? input.nativeKind ?? constructKind);
  const lossIds = uniqueStrings([...(input.lossIds ?? []), input.lossId].filter(Boolean));
  const evidenceIds = uniqueStrings([...(input.evidenceIds ?? []), input.evidenceId].filter(Boolean));
  return withoutUndefined({
    kind: 'frontier.lang.universalDialectRecord',
    version: 1,
    id: normalizeOptionalString(input.id) ?? dialectRecordId({ language, dialect, constructKind, name, index: context.index }),
    language,
    dialect,
    constructKind,
    name,
    nativeKind: normalizeOptionalString(input.nativeKind),
    sourcePath: normalizeOptionalString(input.sourcePath ?? context.sourcePath),
    sourceSpan: input.sourceSpan,
    nativeSourceId: normalizeOptionalString(input.nativeSourceId),
    nativeAstId: normalizeOptionalString(input.nativeAstId),
    nativeAstNodeId: normalizeOptionalString(input.nativeAstNodeId ?? input.nodeId),
    semanticNodeId: normalizeOptionalString(input.semanticNodeId),
    semanticSymbolId: normalizeOptionalString(input.semanticSymbolId),
    semanticOccurrenceId: normalizeOptionalString(input.semanticOccurrenceId),
    sourceMapId: normalizeOptionalString(input.sourceMapId),
    sourceMapMappingId: normalizeOptionalString(input.sourceMapMappingId),
    externIds: uniqueStrings([...(input.externIds ?? []), input.externId].filter(Boolean)),
    lossIds,
    evidenceIds,
    projection: normalizeDialectProjection(input.projection ?? input.projectionEvidence, { lossIds, evidenceIds }),
    payload: input.payload,
    metadata: input.metadata ? { ...input.metadata } : undefined
  });
}

export function createUniversalExternRecord(input = {}, context = {}) {
  const language = normalizeOptionalString(input.language ?? context.language);
  const dialect = normalizeOptionalString(input.dialect ?? context.dialect ?? language ?? 'extern');
  const externKind = normalizeOptionalString(input.externKind ?? input.constructKind ?? context.externKind ?? 'foreignSymbol');
  const name = normalizeOptionalString(input.name ?? input.symbol ?? input.binding?.symbol ?? externKind);
  const lossIds = uniqueStrings([...(input.lossIds ?? []), input.lossId].filter(Boolean));
  const evidenceIds = uniqueStrings([...(input.evidenceIds ?? []), input.evidenceId].filter(Boolean));
  return withoutUndefined({
    kind: 'frontier.lang.universalExternRecord',
    version: 1,
    id: normalizeOptionalString(input.id) ?? externRecordId({ language, dialect, externKind, name, index: context.index }),
    language,
    dialect,
    externKind,
    name,
    binding: input.binding ? { ...input.binding } : undefined,
    sourcePath: normalizeOptionalString(input.sourcePath ?? context.sourcePath),
    sourceSpan: input.sourceSpan,
    nativeSourceId: normalizeOptionalString(input.nativeSourceId),
    nativeAstId: normalizeOptionalString(input.nativeAstId),
    nativeAstNodeId: normalizeOptionalString(input.nativeAstNodeId ?? input.nodeId),
    semanticNodeId: normalizeOptionalString(input.semanticNodeId),
    semanticSymbolId: normalizeOptionalString(input.semanticSymbolId),
    semanticOccurrenceId: normalizeOptionalString(input.semanticOccurrenceId),
    sourceMapId: normalizeOptionalString(input.sourceMapId),
    sourceMapMappingId: normalizeOptionalString(input.sourceMapMappingId),
    lossIds,
    evidenceIds,
    projection: normalizeDialectProjection(input.projection ?? input.projectionEvidence, { lossIds, evidenceIds }),
    payload: input.payload,
    metadata: input.metadata ? { ...input.metadata } : undefined
  });
}

export function createUniversalDialectRegistry(input = {}, context = {}) {
  const source = input?.kind === 'frontier.lang.universalDialectRegistry' ? input : input ?? {};
  const dialects = uniqueRecordsById((source.dialects ?? source.records ?? []).map((record, index) => createUniversalDialectRecord(record, {
    language: source.language ?? context.language,
    dialect: source.dialect ?? context.dialect,
    sourcePath: source.sourcePath ?? context.sourcePath,
    index
  })));
  const externs = uniqueRecordsById((source.externs ?? []).map((record, index) => createUniversalExternRecord(record, {
    language: source.language ?? context.language,
    dialect: source.dialect ?? context.dialect,
    sourcePath: source.sourcePath ?? context.sourcePath,
    index
  })));
  const language = normalizeOptionalString(source.language ?? context.language);
  const id = normalizeOptionalString(source.id)
    ?? `dialect_registry_${idFragment(language ?? source.sourcePath ?? context.sourcePath ?? dialects[0]?.dialect ?? externs[0]?.dialect ?? 'mixed')}`;
  const registry = {
    kind: 'frontier.lang.universalDialectRegistry',
    version: 1,
    id,
    language,
    dialects,
    externs,
    metadata: source.metadata ? { ...source.metadata } : undefined
  };
  return withoutUndefined({ ...registry, summary: summarizeUniversalDialectRegistry(registry) });
}

export function summarizeUniversalDialectRegistry(input = {}) {
  const dialects = input.dialects ?? [];
  const externs = input.externs ?? [];
  const records = [...dialects, ...externs];
  return {
    dialects: dialects.length,
    externs: externs.length,
    records: records.length,
    languages: uniqueStrings(records.map((record) => record.language).filter(Boolean)),
    dialectNames: uniqueStrings(records.map((record) => record.dialect).filter(Boolean)),
    constructKinds: countByPresent(dialects.map((record) => record.constructKind)),
    externKinds: countByPresent(externs.map((record) => record.externKind)),
    lossIds: uniqueStrings(records.flatMap((record) => record.lossIds ?? [])),
    evidenceIds: uniqueStrings(records.flatMap((record) => record.evidenceIds ?? [])),
    sourceMapIds: uniqueStrings(records.flatMap((record) => [record.sourceMapId, ...(record.projection?.sourceMapIds ?? [])]).filter(Boolean)),
    projectionDispositions: countByPresent(records.map((record) => record.projection?.disposition)),
    projectionReadiness: records.reduce(
      (readiness, record) => maxSemanticMergeReadiness(readiness, projectionDispositionReadiness(record.projection?.disposition)),
      'ready'
    ),
    recordsWithLosses: records.filter((record) => (record.lossIds ?? []).length > 0).length,
    recordsWithProjectionEvidence: records.filter((record) => (record.projection?.evidenceIds ?? []).length > 0).length
  };
}

export function createUniversalDialectLayer(universalAst, registry) {
  const records = [...registry.dialects, ...registry.externs];
  const references = uniqueReferences([
    { kind: 'dialectRegistry', id: registry.id, layer: 'dialects' },
    ...registry.dialects.map((record) => ({ kind: 'dialectRecord', id: record.id, layer: 'dialects' })),
    ...registry.externs.map((record) => ({ kind: 'externRecord', id: record.id, layer: 'dialects' })),
    ...records.flatMap(recordReferences)
  ]);
  return {
    kind: 'frontier.lang.universalAstLayer',
    version: 1,
    id: `layer:${registry.id}:dialects`,
    layer: 'dialects',
    nativeSourceIds: uniqueStrings(records.map((record) => record.nativeSourceId).filter(Boolean)),
    nativeAstIds: uniqueStrings(records.map((record) => record.nativeAstId).filter(Boolean)),
    nativeAstNodeIds: uniqueStrings(records.map((record) => record.nativeAstNodeId).filter(Boolean)),
    semanticNodeIds: uniqueStrings(records.map((record) => record.semanticNodeId).filter(Boolean)),
    semanticIndexId: universalAst.semanticIndex?.id,
    semanticSymbolIds: uniqueStrings(records.map((record) => record.semanticSymbolId).filter(Boolean)),
    semanticOccurrenceIds: uniqueStrings(records.map((record) => record.semanticOccurrenceId).filter(Boolean)),
    sourceMapIds: registry.summary.sourceMapIds,
    sourceMapMappingIds: uniqueStrings(records.flatMap((record) => [
      record.sourceMapMappingId,
      ...(record.projection?.sourceMapMappingIds ?? [])
    ]).filter(Boolean)),
    lossIds: registry.summary.lossIds,
    evidenceIds: registry.summary.evidenceIds,
    references,
    records: [registry],
    metadata: {
      registryId: registry.id,
      dialectRecords: registry.summary.dialects,
      externRecords: registry.summary.externs,
      constructKinds: registry.summary.constructKinds,
      externKinds: registry.summary.externKinds,
      projectionReadiness: registry.summary.projectionReadiness,
      note: 'Dialect records preserve language-specific constructs with explicit loss and projection evidence instead of lowering them into generic stubs.'
    }
  };
}

export function attachUniversalDialectRegistry(universalAst, input = {}) {
  if (!universalAst || typeof universalAst !== 'object') {
    throw new Error('attachUniversalDialectRegistry requires a universal AST envelope');
  }
  const existing = universalAst.metadata?.dialects;
  const registry = createUniversalDialectRegistry({
    ...(existing && typeof existing === 'object' ? existing : {}),
    ...input,
    dialects: [...((existing && typeof existing === 'object' ? existing.dialects : []) ?? []), ...(input.dialects ?? input.records ?? [])],
    externs: [...((existing && typeof existing === 'object' ? existing.externs : []) ?? []), ...(input.externs ?? [])]
  }, {
    language: universalAst.metadata?.sourceLanguage,
    sourcePath: universalAst.metadata?.sourcePath
  });
  const metadata = {
    ...(universalAst.metadata ?? {}),
    dialects: registry,
    language: { ...objectValue(universalAst.metadata?.language), externs: registry.externs }
  };
  return { ...universalAst, metadata, layers: { ...(universalAst.layers ?? {}), dialects: createUniversalDialectLayer(universalAst, registry) } };
}

export function attachInputUniversalDialectRegistry(universalAst, input = {}, context = {}) {
  if (!hasUniversalDialectRegistryInput(input)) return universalAst;
  const registryInput = input.universalDialectRegistry ?? {};
  return attachUniversalDialectRegistry(universalAst, {
    ...registryInput,
    language: context.language ?? input.language,
    sourcePath: context.sourcePath ?? input.sourcePath,
    dialects: [...(registryInput.dialects ?? registryInput.records ?? []), ...(input.dialects ?? [])],
    externs: [...(registryInput.externs ?? []), ...(input.externs ?? [])]
  });
}

export function hasUniversalDialectRegistryInput(input) {
  return Boolean(
    input?.universalDialectRegistry
    || (input?.dialects && input.dialects.length)
    || (input?.externs && input.externs.length)
  );
}

export function normalizeDialectProjection(input = {}, context = {}) {
  const projection = input && typeof input === 'object' ? input : {};
  const lossIds = uniqueStrings([...(projection.lossIds ?? []), ...(context.lossIds ?? [])]);
  const evidenceIds = uniqueStrings([...(projection.evidenceIds ?? []), ...(context.evidenceIds ?? [])]);
  const disposition = normalizeProjectionDisposition(projection.disposition, lossIds);
  return withoutUndefined({
    disposition,
    readiness: projection.readiness ?? projectionDispositionReadiness(disposition),
    targets: normalizeStringList(projection.targets ?? projection.target),
    lossIds,
    evidenceIds,
    sourceMapIds: uniqueStrings([...(projection.sourceMapIds ?? []), projection.sourceMapId].filter(Boolean)),
    sourceMapMappingIds: uniqueStrings([...(projection.sourceMapMappingIds ?? []), projection.sourceMapMappingId].filter(Boolean)),
    notes: normalizeStringList(projection.notes ?? projection.note),
    metadata: projection.metadata ? { ...projection.metadata } : undefined
  });
}

export function projectionDispositionReadiness(disposition) {
  switch (disposition) {
    case 'preserved':
    case 'lossless':
      return 'ready';
    case 'lossy':
    case 'declaration-only':
      return 'ready-with-losses';
    case 'stub-only':
    case 'unsupported':
      return 'blocked';
    default:
      return 'needs-review';
  }
}

function recordReferences(record) {
  return [
    record.nativeSourceId ? { kind: 'nativeSource', id: record.nativeSourceId } : undefined,
    record.nativeAstId ? { kind: 'nativeAst', id: record.nativeAstId } : undefined,
    record.nativeAstNodeId ? { kind: 'nativeAstNode', id: record.nativeAstNodeId } : undefined,
    record.semanticNodeId ? { kind: 'semanticNode', id: record.semanticNodeId } : undefined,
    record.semanticSymbolId ? { kind: 'semanticSymbol', id: record.semanticSymbolId } : undefined,
    record.semanticOccurrenceId ? { kind: 'semanticOccurrence', id: record.semanticOccurrenceId } : undefined,
    record.sourceMapId ? { kind: 'sourceMap', id: record.sourceMapId } : undefined,
    record.sourceMapMappingId ? { kind: 'sourceMapMapping', id: record.sourceMapMappingId } : undefined,
    ...(record.lossIds ?? []).map((id) => ({ kind: 'loss', id })),
    ...(record.evidenceIds ?? []).map((id) => ({ kind: 'evidence', id })),
    ...(record.projection?.sourceMapIds ?? []).map((id) => ({ kind: 'sourceMap', id })),
    ...(record.projection?.sourceMapMappingIds ?? []).map((id) => ({ kind: 'sourceMapMapping', id }))
  ].filter(Boolean);
}

function uniqueReferences(references) {
  const seen = new Set();
  const result = [];
  for (const reference of references) {
    if (!reference?.id) continue;
    const key = `${reference.kind}:${reference.id}:${reference.layer ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(reference);
  }
  return result;
}

function uniqueStrings(values) {
  return [...new Set((values ?? []).filter((value) => value !== undefined && value !== null).map((value) => String(value)).filter(Boolean))];
}

function uniqueRecordsById(records) {
  const seen = new Set();
  const result = [];
  for (const record of records ?? []) {
    if (!record?.id || seen.has(record.id)) continue;
    seen.add(record.id);
    result.push(record);
  }
  return result;
}

function normalizeStringList(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  return [String(value)].filter(Boolean);
}

function maxSemanticMergeReadiness(left, right) {
  const rank = { ready: 0, 'ready-with-losses': 1, 'needs-review': 2, blocked: 3 };
  const leftRank = rank[left] ?? rank['needs-review'];
  const rightRank = rank[right] ?? rank['needs-review'];
  return leftRank >= rightRank ? left : right;
}

function idFragment(value) {
  return String(value ?? 'native')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'native';
}

function dialectRecordId(input) {
  return [
    'dialect',
    idFragment(input.language ?? 'mixed'),
    idFragment(input.dialect ?? 'unknown'),
    idFragment(input.constructKind ?? 'construct'),
    idFragment(input.name ?? input.index ?? 'record')
  ].join('_');
}

function externRecordId(input) {
  return [
    'extern',
    idFragment(input.language ?? 'mixed'),
    idFragment(input.dialect ?? 'unknown'),
    idFragment(input.externKind ?? 'extern'),
    idFragment(input.name ?? input.index ?? 'record')
  ].join('_');
}

function countByPresent(values) {
  const counts = {};
  for (const value of values ?? []) {
    if (value === undefined || value === null || value === '') continue;
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function normalizeProjectionDisposition(value, lossIds) {
  const normalized = normalizeOptionalString(value);
  return normalized ?? (lossIds.length ? 'review-required' : 'preserved');
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function withoutUndefined(value) {
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) result[key] = entry;
  }
  return result;
}
