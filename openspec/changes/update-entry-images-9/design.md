## Context
This is a scoped limit change that touches both client and cloud functions. Existing image upload and preview patterns are already in production and should remain stable.

## Goals / Non-Goals
- Goals:
  - Raise entry image cap from 3 to 9 consistently across publish, persistence, query, and detail display.
  - Keep existing CloudBase upload mechanism and contracts backward-compatible.
- Non-Goals:
  - Changing storage schema beyond the limit.
  - Adding image editing, sorting, or cleanup of orphaned uploads.

## Decisions
- Decision: keep client-side pre-upload to CloudBase and submit fileID array to `entry_create`.
  - Rationale: preserves current architecture and minimizes cloud function complexity.
- Decision: enforce max image count server-side at 9.
  - Rationale: prevents client bypass and keeps data constraints authoritative.
- Decision: render day detail images with wrapping fixed-size thumbnails that naturally form a 3-column grid for up to 9 items.
  - Rationale: minimal UI change and works across device widths.

## Risks / Trade-offs
- Risk: more images increase upload time and publish latency.
  - Mitigation: keep compressed selection and existing loading state.
- Risk: upload succeeds but create fails, leaving unused files.
  - Mitigation: accepted MVP behavior, unchanged from existing flow.
