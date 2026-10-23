# Contributing to how.nixfred.com

Pull requests to this repo are welcome: fixes, new modules, clearer wording.

1. Fork `nixfred/how.nixfred.com-public` and branch from `main`.
2. Make the change. For a new guide module, a Markdown file is enough; say where it should sit.
3. Open a PR against `main` and describe what it fixes and why.

## What happens next

- Fred reviews every PR here.
- This repo is synced from a private source repo after each deploy. The sync adds one normal commit on `main`; it never force-pushes, so your PR branch and base stay usable.
- An accepted PR is ported into the source repo with you as author or co-author (`Co-authored-by:`), then arrives here on the next sync. The PR is closed with a link to that sync commit. Merging here directly would be overwritten by the next sync, which is why changes go in at the source.

Issues are open too, if you would rather describe a problem than fix it.
