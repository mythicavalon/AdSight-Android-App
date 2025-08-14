# AdSight — Product Overview

## Mission
Privacy-first ad prediction and insight app that helps users understand why they see ads, entirely on-device.

## Core Value
- Offline predictions with transparent reasoning
- Data sovereignty (imports are local; no server)
- Clear, human-readable insights (what and why)

## Key Features
- Onboarding and Consent with explicit privacy guarantees
- Profile creation: interests, preferences, searches, purchases
- Prediction Engine: per-platform categories, confidence, reasoning
- Analytics: completeness, diversity, trends
- Notifications: monthly profile update reminders (opt-in)
- Import (1.1.0): parsers scaffold for Google Takeout, Facebook/Instagram, Amazon; activity log
- Source Attribution groundwork: infer origin from URLs/UTM/domain maps

## v1.1.0 Scope
- Import Data screen
- Consent performance improvements
- Dark theme readability improvements

## Next (Proposed)
- Implement concrete parsers for:
  - Google Ad Center / Takeout JSONs
  - Facebook/Instagram AYO JSON
  - Amazon order CSV/JSON
- Share-sheet receiver (Android): URL + image OCR (on-device)
- URL/source classifier: UTM parsing, domain catalog (search/social/shopping/news)
- On-device ML ranker (TF Lite/TFJS) to refine category order
- Optional online updates for taxonomy (opt-in only)

## Tech Notes
- Stack: React Native (Expo SDK 53), RN 0.79.5
- Navigation: React Navigation 6
- UI: React Native Paper
- Storage: AsyncStorage
- Notifications: expo-notifications
- Android: RN new architecture ready; ProGuard configured for Reanimated/RNGH/Screens

## Distribution
- APK zips at repo root for easy access

## Legal & Privacy
- No background scraping of other apps
- Imports are user-provided exports or share-sheet — explicit consent
- All processing on-device; no network required by default