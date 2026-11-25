# Pull Request Examples

Each shows a title and a body in the four-section shape that `compliance pull-request` enforces.

## Feature PR

```text
Title: feat(lexico): ✨ add dictionary search autocomplete

## 🌰 Summary

Adds autocomplete suggestions to the dictionary search input.

## 📝 Details

- Add SearchAutocomplete component
- Integrate with search API for suggestions
- Add keyboard navigation support
- Add loading and empty states

## 🧪 Testing

1. Run `nx run lexico-web:vitest`.
2. Run `nx run lexico-web:start`, navigate to the search page, and type a query.

## 🔗 Related

- Closes #234
```

## Bug Fix PR

````text
Title: fix(caelundas): 🐛 correct timezone offset in ephemeris

## 🌰 Summary

Fixes incorrect timezone handling for ephemeris calculations near DST boundaries.

## 📝 Details

- Use moment-timezone for DST-aware calculations
- Add edge case handling for DST transitions
- Add regression tests

## 🧪 Testing

1. Run both suites:

   ```bash
   nx run caelundas-cli:vitest:unit
   nx run caelundas-cli:vitest:integration
   ```

## 🔗 Related

- Fixes #456
````

## Documentation PR

```text
Title: docs(documentation): 📝 add contributing guide

## 🌰 Summary

Adds comprehensive CONTRIBUTING.md with setup instructions and guidelines.

## 📝 Details

- Add CONTRIBUTING.md
- Update README.md with link to contributing guide
- Add development setup section

## 🧪 Testing

1. Review the documentation changes in the PR diff.

## 🔗 Related

- Closes #345
- [CONTRIBUTING.md](.github/CONTRIBUTING.md), the guide this adds.
```

## Dependency Update PR

```text
Title: chore(dependencies): ⬆️ upgrade tanstack router to v1.50

## 🌰 Summary

Updates TanStack Router to latest version with bug fixes.

## 📝 Details

- Upgrade @tanstack/react-router from 1.45.0 to 1.50.0
- Update peer dependencies
- Fix breaking changes in route definitions

## 🧪 Testing

1. Run `nx run lexico-web:vitest`.
2. Run `nx run lexico-web:start` and confirm every route works as before.

## 🔗 Related

- Closes #567
- [TanStack Router releases](https://github.com/TanStack/router/releases)
```
