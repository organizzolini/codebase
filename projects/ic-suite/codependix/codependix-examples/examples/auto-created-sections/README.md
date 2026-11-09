# 🪄 Auto-creating the `````

## A project with no `README.md`, on `--write`

Fails outright, in either mode. The file itself not existing is a more serious problem than a missing anchor — there is nothing to splice into and nothing safe to create.

```text
AnchorNotFoundError: Anchor "example-nx" not found in <project>/README.md
```

## A `README.md` with no anchor, on `--check`

Reported as stale rather than raising, consistent with every other kind of drift this tool reports. A project that has never had codependix output simply shows up as needing a write.

```text
isCurrent: false
stalePaths: README.md
```

## Next

[check-and-write](../check-and-write/README.md).
