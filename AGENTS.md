# Fragment contributor instructions

## Project overview

Fragment is a Deno 2.9+ TypeScript monorepo for framework-agnostic web application tooling. Each top-level module is developed as an independent workspace package and may be published to JSR under the `@deft-plus` scope.

Keep shared behavior framework-independent. Framework-specific integrations must depend on public module APIs and must not leak framework runtime concepts into foundational packages.

## Repository structure

- Each publishable module lives in a top-level directory such as `reactivity/` or `i18n/`.
- Root configuration, workflows, documentation, and contributor tooling apply to every module.
- `.github/workflows/` validates changes and publishes workspace packages.
- `deno.json` defines the workspace, shared tasks, compiler options, formatting, and linting.

Every module should follow this basic layout:

```text
<module>/
├── deno.json
├── mod.ts
├── README.md
├── <api>.ts
└── <api>_test.ts
```

- The module's `deno.json` owns its JSR `name`, `version`, and `exports`.
- `mod.ts` is the deliberate public entry point. Export only supported APIs.
- Keep tests beside their implementation and name them `*_test.ts`.
- Prefix implementation-only files with `_` when the distinction is useful.
- A workspace member that must not be published must set `"publish": false`.

## Quality gate

Run commands from the repository root:

```bash
deno ci
deno task check
deno task fmt
deno task lint
deno task test
deno task jsdoc:lint
```

Run `deno publish --dry-run --allow-dirty` when changing package metadata, exports, dependencies, or published files. Run `deno task coverage` after `deno task test` when an HTML coverage report is useful.

The test task runs tests across the complete workspace, reports coverage, and enforces a 100% threshold. Do not weaken the threshold to make a change pass.

## Pull request conventions

PR titles must use a semantic type and a lowercase module scope:

```text
BREAKING(module): title...
[unstable] BREAKING(module): title...
deprecation(module): title...
[unstable] deprecation(module): title...
feature(module): title...
release(module): title...
fix(module): title...
docs(module): title...
refactor(module): title...
perf(module): title...
test(module): title...
ci(module): title...
chore(module): title...
revert(module): title...
```

- Use the affected module directory as the scope. Use `repo` for repository-wide changes.
- Keep the module scope lowercase and use hyphens between words.
- Begin the title after the colon with a lowercase letter.
- Use the `[unstable]` prefix only with `BREAKING` or `deprecation`.

## Source conventions

- Begin every TypeScript source file with this exact header:

  ```ts
  // Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
  ```

- Use explicit `.ts` extensions for relative imports and configured aliases for package dependencies.
- Use one import declaration per module specifier. Combine value and type imports with inline `type` modifiers.
- Preserve strict TypeScript types. Avoid `any`, non-null assertions, unchecked casts, and broad `Function` types unless they are required and documented.
- Use two-space indentation, single quotes, and a 100-column TypeScript line width.
- Prefer Deno and web platform APIs over dependencies that duplicate built-in behavior.
- Do not grant `-A` to routine commands or tests. Request only the permissions the behavior requires.
- Do not use TypeScript accessibility keywords for class members. Use ECMAScript `#private` fields and methods for implementation-private state.

## Documentation conventions

- All declaration documentation must use JSDoc comments beginning with `/**`. Never use plain block comments (`/* ... */`) or consecutive line comments (`// ...`) to document a declaration.
- Document every function, class, interface, type alias, enum, namespace, top-level variable, and top-level constant, whether public or internal.
- Document every class and interface member, including constructors, properties, accessors, methods, and call signatures. Self-explanatory members may use concise one-line JSDoc.
- Comments should have a 80 characters length, links and other longs texts are excluded but keep it 80 long.
- Local implementation comments that explain control flow may use `//`; they are not substitutes for declaration JSDoc.
- Give every regular source file a descriptive module-level JSDoc block containing `@module` immediately after the copyright header and blank line.
- Explain the module's purpose, responsibilities, important exports, typical workflow, and relevant constraints without merely repeating its filename.
- Modules exposing important user-facing behavior must include a practical, titled `@example` using a fenced `ts` block.
- `mod.ts` and test files use only the copyright header followed by a blank line; they do not require module-level JSDoc.
- Document every public API with its behavior, parameters, return value, type parameters, and a realistic titled `@example` when it adds useful context.
- Keep public signatures free of private referenced types so `deno doc --lint` succeeds.
- Order public API documentation as: summary and details, `@example`, `@template`, `@param`, and `@returns`.
- Format tags exactly as `@template T - Description.`, `@param value - Description.`, and `@returns Description.`.
- Give internal declarations concise but complete JSDoc. Put `@internal` last, separated from parameter and return tags by a blank JSDoc line.
- Every top-level constant requires JSDoc. A public constant may use concise one-line JSDoc. An internal constant must use a multiline JSDoc block with `@internal` on its own line.
- Update the module README and relevant detailed documentation alongside user-visible behavior.
- Describe planned capabilities as planned until implementation and tests exist.

Use this exact structure as the documentation reference:

````ts
// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * Provides the public utilities for creating and using a typed resource.
 *
 * Use {@link createResource} to initialize the resource, then call its
 * methods to read or update values. The module validates inputs before
 * applying changes and reports invalid operations with {@link ResourceError}.
 *
 * @example Create and read a resource
 * ```ts
 * const resource = createResource({ name: 'Example' });
 * console.log(resource.get('name'));
 * ```
 *
 * @module
 */

/**
 * Description of the public API.
 *
 * @example Usage
 * ```ts
 * const result = createThing(value);
 * ```
 *
 * @template T - Type information.
 * @param value - Parameter information.
 * @returns Return information.
 *
 * @internal
 */
function remove<T>(text: T): string {
  // Implementation...
}

/**
 * Description of the internal constant.
 * @internal
 */
const INTERNAL_CONST = 'internal';

/** Description of the public constant. */
const PUBLIC_CONST = 'public';
````

## Testing conventions

- Register independent top-level cases with `Deno.test(name, fn)` and arrow functions. Do not use BDD wrappers or test steps.
- Prefer `@std/expect` for expectations and `@std/testing/mock` only for spies and stubs.
- Name tests `<function-or-method>() <behavior>` and include parentheses after callable names.
- Keep tests deterministic and isolated from ambient network, filesystem, locale, timezone, permissions, and environment state unless the test explicitly controls them.
- Add focused regression coverage for every bug fix and boundary coverage for new behavior.
- Assert complete structures when fields, ordering, discriminants, or optionality are part of the contract.

## Releases

- Keep each publishable module's version and lockfile state synchronized before creating a GitHub release.
- The release workflow runs the complete quality gate and publishes every eligible workspace member with `deno publish --check=all`.
- JSR publishing uses GitHub Actions OIDC provenance; do not add a long-lived JSR token.
- Do not publish internal helpers or unfinished APIs merely to make tests import them.
