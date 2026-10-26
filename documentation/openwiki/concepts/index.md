# Files

- [Generator / Template / Instance Model](generator-template-instance.md) - Explains the conformetry generator/template/instance model that governs all scaffolding. A template defines file structure and content with parameterized inputs; generating renders it into a target directory creating an instance; validating re-renders the template with the instance's substitutions and compares structurally (AST for TypeScript, mdast for markdown, Python AST for Python) to detect drift.
- [Meander Theory](meander-theory.md) - Documents the mathematical/mechanical model behind meanderaw's pattern generation: the lattice address system (Code, rows, columns), the crossing/interlace mechanics, the band/parallel/branch structure, and how characteristics are computed from the Code.
