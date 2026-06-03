#!/usr/bin/env bash
set -euo pipefail

# Download the latest `prisma-artifacts` artifact from the GitHub Actions `prisma.yml` workflow
# Usage:
#   ./scripts/download-prisma-artifact.sh --repo owner/repo [--workflow prisma.yml] [--output ./prisma-artifacts]
# Requirements:
# - Either `gh` (GitHub CLI) installed and authenticated, or
# - `GITHUB_TOKEN` env var set and `jq` installed for API fallback

WORKFLOW=${WORKFLOW:-prisma.yml}
ARTIFACT_NAME=${ARTIFACT_NAME:-prisma-artifacts}
OUTPUT_DIR=${OUTPUT_DIR:-./prisma-artifacts}
REPO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --workflow) WORKFLOW="$2"; shift 2;;
    --output) OUTPUT_DIR="$2"; shift 2;;
    --artifact) ARTIFACT_NAME="$2"; shift 2;;
    -h|--help) echo "Usage: $0 --repo owner/repo [--workflow prisma.yml] [--output dir]"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [[ -z "$REPO" ]]; then
  echo "Error: --repo owner/repo is required"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

if command -v gh >/dev/null 2>&1; then
  echo "Using GitHub CLI to download artifact for workflow $WORKFLOW"
  # Find latest run id for workflow
  RUN_ID=$(gh run list --workflow "$WORKFLOW" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || true)
  if [[ -z "$RUN_ID" || "$RUN_ID" == "null" ]]; then
    echo "No workflow run found for $WORKFLOW"
    exit 1
  fi
  echo "Found run: $RUN_ID"
  gh run download "$RUN_ID" --name "$ARTIFACT_NAME" --dir "$OUTPUT_DIR"
  echo "Downloaded artifact to $OUTPUT_DIR"
  exit 0
fi

echo "GitHub CLI not found. Falling back to GitHub API (requires GITHUB_TOKEN and jq)."
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: set GITHUB_TOKEN environment variable for API fallback or install gh CLI"
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required for API fallback. Install jq or use gh CLI."
  exit 1
fi

echo "Querying workflow runs via API..."
API="https://api.github.com/repos/$REPO/actions/workflows/$WORKFLOW/runs?status=success&per_page=1"
RUN_ID=$(curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "$API" | jq -r '.workflow_runs[0].id')
if [[ "$RUN_ID" == "null" || -z "$RUN_ID" ]]; then
  echo "No successful workflow run found for $WORKFLOW"
  exit 1
fi
echo "Found run id: $RUN_ID"

ARTIFACTS_API="https://api.github.com/repos/$REPO/actions/runs/$RUN_ID/artifacts"
ARTIFACT_ID=$(curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "$ARTIFACTS_API" | jq -r --arg name "$ARTIFACT_NAME" '.artifacts[] | select(.name==$name) | .id')
if [[ -z "$ARTIFACT_ID" || "$ARTIFACT_ID" == "null" ]]; then
  echo "Artifact $ARTIFACT_NAME not found in run $RUN_ID"
  exit 1
fi
echo "Found artifact id: $ARTIFACT_ID"

DOWNLOAD_URL="https://api.github.com/repos/$REPO/actions/artifacts/$ARTIFACT_ID/zip"
TMPZIP=$(mktemp --suffix=.zip)
echo "Downloading artifact..."
curl -L -sS -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/octet-stream" "$DOWNLOAD_URL" -o "$TMPZIP"
echo "Unzipping to $OUTPUT_DIR"
unzip -o "$TMPZIP" -d "$OUTPUT_DIR"
rm -f "$TMPZIP"
echo "Artifact downloaded to $OUTPUT_DIR"
