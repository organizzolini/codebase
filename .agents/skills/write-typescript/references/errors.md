# Error Handling

## Catch Clauses Use unknown

Always type caught errors as `unknown`, then narrow.

```typescript
// ❌ WRONG
try {
  await fetchData();
} catch (error: any) {
  console.error(error.message);
}

// ✅ CORRECT
try {
  await fetchData();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```
