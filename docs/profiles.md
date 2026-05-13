# Profiles

Profiles package Lore's vault-facing taxonomy, additive schema, and prompt
registry. Phase 1 ships one built-in profile:

```yaml
profile: default@1.0.0
```

When `.lore.yaml` omits `profile`, Lore resolves the same selector in memory.
Read-only startup paths do not rewrite `.lore.yaml`. New `lore init` configs
write the selector explicitly so fresh installs are pinned to the runtime
default profile version.

The runtime profile version comes from `profiles/default/profile.yaml`, not
from `package.json`. Do not bump it with package releases unless the profile
contract itself changes.

## Owned Surfaces

The active profile owns:

- closed write-time memory tags
- entity kind options
- writable fact predicates
- additive Notion properties for Projects, Topics, Memories, Entities, and Facts
- prompt registry entries for autosave extraction, autosave tool guidance,
  atomic-learning extraction, digest synthesis, conflict judging, and
  LongMemEval simulated autosave

Core enums remain code-owned. Memory kind/status/confidence, task state,
review state, scope/lifetime values, and internal fact predicates are not
profile-extensible in Phase 1.

Read filters for tags intentionally accept arbitrary non-empty strings so
operators can find legacy or out-of-profile rows. Write paths validate against
the active profile vocabulary and point free-form labels at `keywords`.

## Profile Files

A profile root contains:

- `profile.yaml` with `name`, `version`, and optional `taxonomy`, `schema`,
  and `prompts` paths
- `taxonomy.yaml` with `tags`, `entityKinds`, and `writableFactPredicates`
- `schema.yaml` with additive database properties only
- prompt text files referenced by the prompt registry

`profile.yaml extends` is reserved for profile composition and is rejected
with an explicit error until that later phase lands.

Profile names are kebab-case and selectors are exact `<name>@<semver>` values.
Ranges and floating versions are intentionally unsupported. Phase 1 resolves
only the built-in `default` profile; non-default profiles are test fixtures
until profile distribution is designed.

`manifestDigest` is `sha256:<hex>` over the normalized `profile.yaml` and every
schema, taxonomy, and prompt file that participates in the effective profile.
Relative paths and normalized content are included in stable sorted order.
Docs, READMEs, and eval fixtures do not participate unless a later phase makes
them part of resolution.

## Schema Contract

The five Lore databases and all core property names remain code-owned via
`PROJECT_PROPS`, `TOPIC_PROPS`, `MEMORY_PROPS`, `ENTITY_PROPS`, and
`FACT_PROPS`. Profiles may add properties after the core set is built. They may
not remove, rename, or override core properties, and they may not alter relation
topology.

Supported additive property types are `rich_text`, `number`, `select`,
`multi_select`, `date`, `checkbox`, `url`, `email`, and `phone_number`.
`number` supports Notion's plain `number` format only in Phase 1. `select` and
`multi_select` options declare `name` and may declare a Notion color from the
standard color vocabulary. Relation, rollup, formula, title, status, people,
file, created/edited metadata, unique id, and any unlisted property type are
rejected.

## Prompt Contract

Every resolved profile has an effective prompt for all required keys:
autosave extraction filter, autosave tool guidance, atomic-learning extraction,
digest synthesis, conflict judge, and LongMemEval simulated autosave. A
non-default fixture may omit prompt keys; omitted keys fall back to the
core/default prompt for that key. This prompt fallback is not profile
composition and does not enable schema or taxonomy inheritance.

Prompt templates may reference only variables allowlisted for that prompt key.
Default prompt files are data-backed copies of the current code-owned prompts;
tests assert that rendering through the default profile is byte-identical to
the core renderer.

## Taxonomy Contract

Profile-owned taxonomy is runtime data. Tags, entity kinds, and
agent-writable fact predicates are typed as strings and validated at write
boundaries against the active profile. Default-profile constants remain
available as fixtures and backwards-compatible helpers, but they are not the
active runtime source of truth once services have resolved a profile.

Generic fact predicates `is_a`, `has_a`, and `related_to` are always available.
Reserved/internal predicates cannot appear in profile-writable predicate lists:
`mentions`, `decided_by`, `supersedes_decision`, `informs`, `needs_action`,
`waiting_on`, and `blocked_by`.

## Implementation Notes

There is no active-profile singleton. `initServicesFromConfig()` resolves a
`ResolvedProfile` and threads it through services, vault setup/migration, MCP
write validators, CLI tag validation helpers, tag migration, and simulated
autosave schema construction. Hook helpers that cannot carry `LoreServices`
resolve the profile from `.lore.yaml` and pass the resolved prompt registry
into prompt construction. Tests should pass explicit profile objects when they
need a non-default taxonomy, schema, or prompt fixture.
