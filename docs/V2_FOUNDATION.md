# AdSight V2 Foundation

## Goal

V2 makes AdSight more trustworthy by separating **observed signals** from **inferences** and exposing the evidence behind every result.

## Current implementation

`src/intelligence/InferenceEngineV2.ts` provides a side-by-side V2 inference engine without replacing the existing V1 engine yet. This keeps the current UI stable while the new model is validated.

The engine currently supports:

- signal normalization from the existing `UserProfile` shape;
- type-specific signal weights;
- recency decay using half-life weighting;
- evidence records for matched signals;
- corroboration across independent signal types;
- confidence and data-quality estimates;
- explicit uncertainty messages;
- deterministic model versioning.

## Signal weights

The initial weights are intentionally simple and auditable:

| Signal | Base weight |
| --- | ---: |
| Stated interest | 1.0 |
| Recent search | 1.4 |
| App usage | 0.8 |
| Purchase | 2.0 |
| Explicit ad preference | 2.2 |

These values are product heuristics, not measured advertiser probabilities. They should be calibrated against a labeled evaluation set before being described as statistically accurate.

## Recency

Searches use a 30-day half-life. Purchases use a 90-day half-life because purchase intent can remain relevant for longer. Other signals currently use the 30-day default.

A signal's contribution decreases exponentially with age:

```text
multiplier = 0.5 ^ (ageDays / halfLifeDays)
```

## What V2 does not claim

- It does not access proprietary advertiser profiles.
- It does not know whether a platform actually served a particular ad.
- A score is not a guaranteed probability of seeing an ad.
- Platform names describe the model context, not a private API connection.

## Next steps

1. Add a repository abstraction for signals and inference snapshots.
2. Migrate structured state from AsyncStorage to SQLite.
3. Add encrypted database support for production builds.
4. Add model-version persistence and calibration datasets.
5. Add Evidence Explorer and What Changed screens.
6. Add deterministic unit tests for scoring and recency.
7. Only then make V2 the default prediction path.
