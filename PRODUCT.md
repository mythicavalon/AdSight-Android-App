# AdSight Product Direction

AdSight helps people understand what advertising interests can be inferred from data they choose to provide.

## Current direction

The V2 rebuild is focused on a private, local-first, evidence-based experience:

- User-provided profile data and imports remain local to the device.
- AdSight generates deterministic estimates from observed signals.
- Every inference should expose its supporting evidence, confidence, data quality, and uncertainty.
- Platform context is modeled explicitly without claiming access to private advertiser targeting systems.
- Storage is being migrated to encrypted SQLite with the database key protected by the platform secure storage layer.

## First test milestone

The first production-grade test candidate is intentionally narrow:

1. Fresh install and consent.
2. Create or import a user profile.
3. Store the data locally.
4. Generate platform-specific inferences.
5. Inspect the evidence behind an inference.
6. Restart the app and confirm persistence.
7. Delete/reset local data and confirm removal.

## Planned after the first test

- Complete migration of remaining V1 screens to the V2 storage and inference model.
- Robust import normalization and provenance tracking.
- What changed and What if experiences.
- Prediction history and comparison.
- Privacy Center with export and deletion controls.
- Deterministic model fixtures and evaluation before making stronger accuracy claims.

## Product boundaries

AdSight does not scrape other apps, intercept network traffic, use Accessibility APIs for surveillance, or access private advertising APIs. It estimates what could be inferred from the data available to AdSight.

This document is intentionally a product direction document, not a claim that every planned feature is already complete.
