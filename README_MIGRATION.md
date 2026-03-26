# Migration Notes

This file is kept only as historical context for the old migration away from `user_name`-based records.

## Current Reality

- Authentication is handled by Supabase Auth
- The application uses the authenticated session, not `localStorage`, as the source of truth for the current user
- `consumption` records are associated through `user_id`
- The authoritative setup information now lives in `README.md`

If you need to reason about the current product behavior, use `README.md` and `.planning/codebase/*` instead of this document.
