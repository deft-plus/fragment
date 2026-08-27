# Fragment

🧩 **Fragment is a framework-agnostic TypeScript ecosystem providing everything you need to build complete applications across different frameworks. ⚡️🚀.** ⚡

> [!IMPORTANT]
> Fragment is in its initial development stage. APIs and packages are not ready for production use yet.

## Goals

- Provide reusable application tooling without coupling it to a UI framework.
- Keep every capability independently installable and usable.
- Offer first-class integrations for different frameworks through thin adapters.
- Share consistent types, tooling, testing, documentation, and release practices across the ecosystem.

| Module     | Description                              | Status      |
| ---------- | ---------------------------------------- | ----------- |
| `reactive` | 🎯 Effortless reactive values            | Coming Soon |
| `i18n`     | 🌍 Internationalization and localization | Coming Soon |

<!--
Thinking if adding the following modules
| `testing`    | 🧪 Comprehensive testing utilities             | Coming Soon |
| `runtime`    | ⏱️ Runtime utilities and helpers               | Coming Soon |
| `core`       | 🔥 Fine-grained reactivity and components      | Coming Soon |
| `directives` | 🚦 Render expressions and directives           | Coming Soon |
| `cli`        | 🛠️ Command-line interface and utilities        | Coming Soon |
| `compiler`   | 🧱 Compiler and build tools                    | Coming Soon |
| `styled`     | 🎨 Scoped and dynamic styling                  | Coming Soon |
| `forms`      | 📝 Simplified form handling                    | Coming Soon |
| `http`       | 🌐 Seamless API communication                  | Coming Soon |
| `graphql`    | 🛰️ GraphQL queries and mutations               | Coming Soon |
| `motion`     | 🕺 Smooth and declarative animations           | Coming Soon |
| `server`     | 🚀 Server-side rendering and static generation | Coming Soon |
| `db`         | 🗄️ Robust data management and queries          | Coming Soon |
-->

## Development

Fragment requires Deno 2.9 or newer.

```bash
deno ci
deno task lint
deno task check
deno task test
```

Useful additional tasks:

```bash
deno task fmt             # Format the workspace
deno task test:u          # Update snapshots and run the covered test suite
deno task coverage        # Generate an HTML coverage report
deno task jsdoc:lint      # Validate public API documentation
deno task jsdoc:generate  # Generate local API documentation
```

The test task discovers tests across every workspace module, reports coverage, and requires 100% coverage.

## Pull requests

PR titles follow `<type>(<module>): <lowercase title>`, for example:

```text
feature(reactivity): add writable signals
fix(i18n): preserve escaped commas
docs(repo): explain the workspace layout
```

See [`AGENTS.md`](./AGENTS.md) for the complete contribution, testing, documentation, and release conventions.

## Publishing

Creating a GitHub release runs the complete quality gate and publishes eligible workspace packages to JSR with provenance. Package versions must be updated in their module configuration before the release is created.

## License

Fragment is available under the [Apache License 2.0](./LICENSE).
