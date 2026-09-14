# Changelog

All notable changes to this project will be documented here.

## [Unreleased]

### V2 foundation
- Added an evidence-based inference domain model.
- Added deterministic model versioning.
- Added recency-aware signal weighting.
- Added confidence, data-quality, and uncertainty fields.
- Added per-inference evidence records.
- Added a side-by-side `InferenceEngineV2` so the existing UI can remain stable during validation.
- Removed legacy broad Android storage permissions from Expo configuration.
- Refreshed the README to distinguish AdSight inferences from claims about private platform targeting systems.

## [1.1.0] - 2025-08-14
- New: Import Data screen (Google Takeout/Facebook/Instagram/Amazon parsers scaffold)
- New: Source attribution groundwork (share-sheet plan, local parsing)
- UI: Improved contrast and readability in dark mode
- UX: Consent flow performance with immediate navigation and background persistence

## [1.0.3] - 2025-08-14
- Fix: Added react-native-gesture-handler dependency and ProGuard keep rules
- Build: Version bump and stable release packaging

## [1.0.2] - 2025-08-14
- Fix: Added Reanimated Babel plugin and gesture-handler bootstrap import
- Build: First stable APK zip distribution
