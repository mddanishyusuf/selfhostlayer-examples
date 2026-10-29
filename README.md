# Self Host Layer examples

Tiny apps that Self Host Layer's tests deploy from this repo's GitHub tarball. One folder per framework, so they also test the "root directory" setting.

| Folder | Framework | Package manager | Runs as |
|---|---|---|---|
| `next/` | Next.js | npm | Node server (`next start`) |
| `vite/` | Vite | pnpm | Static files served by Caddy |
| `express/` | Express | yarn 1 | Node server, no build step |
| `astro/` | Astro (SSR, Node adapter) | bun | Node server |
| `nuxt/` | Nuxt | npm | Node server (Nitro) |
| `broken/` | Vite with a missing import | npm | Must fail the build cleanly |

Every server app answers `GET /` with its name and `GET /api/health` (Express: `/health`) with `ok`.

`next/` also counts visits in SQLite under `DATA_DIR` (`GET /api/visits`, `?add=1` adds one), for the backup and restore tests, and in Redis when it has one (`GET /api/redis`, `?add=1`).

## Known quirks (on purpose)

- `nuxt/package-lock.json` trips `npm ci` ("not in sync", an npm 11 bug with nested optional dependencies) even when regenerated from scratch. Real projects hit this too, so it stays: the builder must fall back to `npm install` and warn.
- `vite/pnpm-workspace.yaml` approves esbuild's install script (`allowBuilds`). pnpm 11+ fails a frozen install when a dependency's build script isn't approved.
