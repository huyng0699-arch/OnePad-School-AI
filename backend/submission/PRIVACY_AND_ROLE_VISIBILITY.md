# Privacy And Role Visibility

Teacher sees:
- Safe summaries for learning/support/group-work context.
- No raw private text by default.

Parent sees:
- Child-safe progress summaries and recommended support actions.
- No hidden score internals.
- No raw private text.

Admin sees:
- Aggregate-only school overview and AI usage counters.
- No raw private text.

Student-side private internals:
- Hidden score internals are not exposed in parent/admin APIs.

Guardrails:
- No psychological or medical diagnosis output.
- Reports use non-heavy labels and support-oriented wording.
- If `rawPrivateText` exists, `privacyLevel` must be `private`.
