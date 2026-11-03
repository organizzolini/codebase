# Files

- [Shared Common Packages](common-packages.md) - Documents the four shared packages under projects/common/ (persistence, interface, presentation, observability) that application domains depend on. Covers exports, consumption patterns, conventions, and integration summary.
- [IC Suite Toolchains](ic-suite.md) - Documents the four independently versioned IC-Suite toolchains (callidescope, codependix, codometer, conformetry) following the five-layer spine architecture. Covers package structure, CLI usage, Nx targets, CI gate flow, and integration patterns.
- [Infrastructure & Deployment](infrastructure.md) - Documents Docker Compose services (Postgres, SearxNG, Open WebUI), the reusable kubernetes-job Helm chart for batch job deployments with PVC storage, Terraform modules for Linode LKE, OpenRouter, GitHub, and state management, plus GitHub Actions CI/CD workflows.
- [Architecture Overview](overview.md) - High-level system architecture showing the four major domains (affirmancy, caelundas, lexico, meanderaw), the IC-Suite toolchains, shared common packages, and cross-cutting infrastructure.
