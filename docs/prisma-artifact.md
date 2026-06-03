# Downloading Prisma artifacts from GitHub Actions

This document explains how to download the `prisma-artifacts` artifact produced by the `prisma.yml` workflow.

Two methods are provided:

- Recommended: use the `gh` CLI (simple)
- Fallback: use `GITHUB_TOKEN` + `jq` and the GitHub REST API

Script: `techuai/frontend/scripts/download-prisma-artifact.sh`

Usage (recommended with `gh`):

1. Install GitHub CLI and authenticate (`gh auth login`).
2. Run:

```bash
cd techuai/frontend
./scripts/download-prisma-artifact.sh --repo <owner>/<repo>
```

The script will find the latest successful run of the `prisma.yml` workflow and download the artifact into `./prisma-artifacts`.

Usage (fallback with API):

1. Export a personal access token with `repo` scope as `GITHUB_TOKEN`:

```bash
export GITHUB_TOKEN=ghp_...yourtoken...
```
2. Ensure `jq` is installed. Then run the script with the `--repo` argument:

```bash
cd techuai/frontend
./scripts/download-prisma-artifact.sh --repo owner/repo
```

What the script does
- If `gh` is available, it uses `gh run` to locate the latest run and `gh run download` to fetch the artifact.
- Otherwise it uses the GitHub REST API to find the latest successful workflow run for `prisma.yml`, finds the `prisma-artifacts` artifact, downloads the ZIP, and extracts it into `./prisma-artifacts`.

Using the downloaded artifacts
- The artifact contains `dev.db`, `node_modules/.prisma`, and `node_modules/@prisma/client` produced by CI.
- You can copy the generated client files into your frontend `node_modules` or use them in a build container. Example:

```bash
cp -r prisma-artifacts/node_modules/@prisma/client ./node_modules/@prisma/client
cp -r prisma-artifacts/node_modules/.prisma ./node_modules/.prisma
cp prisma-artifacts/dev.db ./prisma/dev.db
```

Optional: publish generated client to registry
- The generated Prisma client is typically architecture-specific and not intended to be published as a package. If you must share it across builds, prefer using the artifact approach above or build your own internal package in CI on the target runner.
