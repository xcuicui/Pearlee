## Context
This change adds optional images to entries while preserving existing text-first behavior and response compatibility for current consumers.

## Goals / Non-Goals
- Goals:
  - Support up to 3 images per entry in MVP.
  - Keep publish flow simple: pick, preview, remove, publish.
  - Keep function contracts backward-compatible for callers that still send text only.
- Non-Goals:
  - Image editing, compression customization, drag reordering.
  - Image usage in home feed emotion card.

## Decisions
- Decision: Upload on client before entry creation.
  - Rationale: `entry_create` stores stable CloudBase `fileID`s only; function stays focused on validation and persistence.
- Decision: Store image IDs in `entries.images` as array of strings.
  - Rationale: Minimal schema extension and easy rendering.
- Decision: Validate `images.length <= 3` server-side.
  - Rationale: Prevent client bypass and protect data consistency.

## Risks / Trade-offs
- Risk: Upload succeeds but `entry_create` fails, leaving orphaned files.
  - Mitigation: Accept for MVP; no cleanup job introduced in this change.
- Risk: Existing clients may ignore images.
  - Mitigation: `images` is additive and optional in responses.
