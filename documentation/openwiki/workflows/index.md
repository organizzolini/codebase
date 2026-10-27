# Files

- [CI/CD Pipelines](ci-cd.md)
- [Code Quality Gates](code-quality.md) - Documents the four IC-Suite quality gates (callidescope depth/breadth, codependix boundaries, codometer limits, conformetry conformance) and their integration into CI via Nx targets.
- [Development Workflow](development.md) - End-to-end development workflow covering the 8-step agent process, project-scoped work rules, Nx commands, code validation gates, pull request compliance, and integration procedures.
- [Release Process](release.md) - Documents the fully automated release pipeline on merge to main: Nx release determines ic-suite package versions from conventional commits, semantic-release bumps root version and creates GitHub release, packages are tagged and published to npm with provenance, then mirrored to GitHub Packages. Explains the dual versioning scheme (per-package + root).
- [Scaffolding with Conformetry](scaffolding.md) - How to scaffold new projects, modules, and components using conformetry generators. Covers the nx g conformetry:<generator> command, the template picker, required inputs, and the validation that ensures generated code stays conformant. Lists available templates and their use cases.
