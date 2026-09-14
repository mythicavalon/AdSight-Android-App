# AdSight Production Blueprint

## Product promise

AdSight helps a person understand what an advertising system could infer about them from data they choose to provide.

The product must distinguish three things everywhere:

1. **Observed**: data explicitly present in an imported or entered source.
2. **AdSight inferred**: a deterministic interpretation produced locally from observed signals.
3. **Platform claimed**: a statement explicitly present in a first-party export or source. AdSight must never invent platform knowledge.

The UI should make this distinction visible without requiring the user to understand the implementation.

## Target architecture

```text
UI
  -> Application services
     -> Import / Profile / Inference / Simulation / History
        -> Domain models
           -> Signal repository
              -> SQLite (optionally SQLCipher where supported)

Inference is pure and deterministic:
  normalized signals
    -> recency
    -> repetition
    -> cross-signal corroboration
    -> platform/category matching
    -> calibrated confidence
    -> evidence graph
    -> snapshot
```

## Final product areas

### Home

The first screen should answer three questions quickly:

- What does AdSight currently think is likely about me?
- How strong is the evidence?
- What changed since the previous analysis?

Avoid a dashboard full of decorative percentages. Every prominent score needs an explanation path.

### Advertising Profile

Show inferred categories as human-readable cards with:

- likelihood band rather than false precision
- confidence/data-quality indicator
- top supporting evidence
- age of evidence
- a link to the detailed explanation

### Evidence Explorer

Every inference must be traceable to the signals that contributed to it. Evidence should show source, timestamp, normalized value, contribution, and a plain-language explanation.

### Platforms

Provide separate views for supported platforms. A platform view should clearly label whether information is:

- imported from that platform
- inferred by AdSight
- unavailable

### Why am I seeing this?

A guided explanation that starts from a category and walks backward through evidence. It must never imply access to private advertiser targeting systems.

### What changed?

Compare two inference snapshots and explain additions, removals, confidence changes, and the evidence responsible for those changes.

### What if?

A sandbox that lets the user add or remove hypothetical signals without modifying their real profile. The result must be clearly marked as a simulation.

### Imports

Pipeline:

```text
file
 -> format detection
 -> parser
 -> schema validation
 -> normalization
 -> deduplication
 -> signal extraction
 -> repository
 -> inference
 -> snapshot
```

Imports should be repeatable and idempotent where possible. The user should be able to see what was imported and delete an import without deleting unrelated data.

### Privacy Center

The user should be able to:

- see what data AdSight stores
- see where each signal came from
- delete individual imports/signals
- delete the complete local profile
- export AdSight's own data
- understand network behavior
- review notification and optional diagnostic settings

Do not claim GDPR/CCPA compliance solely from implementation. Legal compliance is a product and legal review requirement.

## Inference design

The inference engine is intentionally explainable before it is sophisticated.

Baseline conceptual weights:

| Signal | Weight |
| --- | ---: |
| Explicit preference | 2.2 |
| Purchase | 2.0 |
| Repeated/recent search | 1.4+ |
| Interest | 1.0 |
| App activity | 0.8 |

Weights are configuration, not hard-coded product truth. The model version and parameters used for a snapshot must be recorded.

Recency must reduce the influence of stale evidence. Repetition must increase evidence strength without allowing one noisy source to dominate. Multiple independent signal types should provide corroboration.

Confidence must not simply be a transformed score. It should incorporate evidence coverage, signal diversity, freshness, and model uncertainty.

## Design principles

- **Explain before impressing.** A transparent 72% is more useful than an unexplained 94%.
- **Uncertainty is a feature.** Say when evidence is weak, old, sparse, or contradictory.
- **No surveillance shortcuts.** No accessibility scraping, screen scraping, VPN interception, credential harvesting, or hidden collection.
- **No fabricated integrations.** Only label data as platform-sourced when the source actually proves it.
- **Local-first.** Network access should be optional and narrowly justified.
- **Least privilege.** Request Android permissions only when a real user-visible feature needs them.
- **Accessible by default.** Support readable type, touch targets, screen readers, contrast, and reduced-motion-friendly transitions.
- **Recoverable actions.** Destructive privacy actions require confirmation and clear consequences.
- **Fast first paint.** Database initialization and inference should not block the initial shell.
- **Offline resilient.** The core profile and inference experience should remain useful without connectivity.

## Engineering quality gates

Before production release:

- TypeScript check passes
- unit tests cover inference and normalization edge cases
- import fixtures cover malformed, duplicate, stale, and empty data
- Expo Doctor passes or every exception is documented
- Android release build succeeds
- APK is installable on a physical Android device
- onboarding and privacy flows are manually tested
- no secret or credential is present in repository history
- dependency audit has been reviewed
- Android permissions are justified
- production logging excludes imported personal data

## Build artifacts

Source control should not accumulate a new binary for every commit. CI should build a preview APK and publish it as an Actions artifact for testing. A signed release APK may be placed under `test-builds/` only for an explicitly identified release candidate, with its checksum recorded.

The repository therefore contains the build instructions and artifact convention, while CI remains the repeatable source of test binaries.
