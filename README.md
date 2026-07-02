# @shapeshift-labs/frontier-lang-dialects

Runtime-neutral dialect and projection evidence records for Frontier Lang semantic graphs.

This package owns the shared representation for language-specific constructs that should not be erased during import, semantic merge, or target lowering: macros, decorators, reflection metadata, generated modules, runtime bindings, preprocessor constructs, syntax extensions, and toolchain-specific records.

It does not parse source files, compile Frontier source, or emit target code. Parser, compiler, CLI, and target adapters sit above this package.

```js
import {
  attachUniversalDialectRegistry,
  createUniversalDialectRegistry
} from '@shapeshift-labs/frontier-lang-dialects';

const registry = createUniversalDialectRegistry({
  language: 'rust',
  dialects: [{
    dialect: 'rust.macro_rules',
    constructKind: 'macro',
    name: 'route!',
    projection: {
      disposition: 'review-required',
      targets: ['typescript'],
      evidenceIds: ['evidence_rust_macro_expansion']
    }
  }]
});

const astWithDialects = attachUniversalDialectRegistry(universalAst, registry);
```
