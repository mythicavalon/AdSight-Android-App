# AdSight

**See what advertisers can infer about you.**

AdSight is a privacy-first Android app for exploring advertising interests and audience categories that can be inferred from data you choose to provide.

> **Private. Local. Explainable.**

## What AdSight does

AdSight turns user-provided signals into transparent, evidence-backed advertising inferences. It helps you understand how ordinary activity can contribute to an advertising profile without pretending to have access to private advertiser systems.

### Core capabilities

- **Advertising profile**: Explore categories AdSight infers from your signals.
- **Evidence Explorer**: See the signals that support an inference and why they contributed.
- **Confidence and uncertainty**: Distinguish stronger evidence from weak, stale, sparse, or single-source evidence.
- **Platform views**: Explore platform-specific models without claiming access to internal targeting data.
- **What changed**: Compare inference snapshots as your data changes.
- **What if?**: Experiment with hypothetical signals without modifying the real profile.
- **Data import**: Bring in data exports you own and choose to analyze.
- **Privacy controls**: Keep the profile local and control what you provide.

## Important distinction

AdSight is an **inference and education tool**, not an advertiser API.

It does not claim to know the private targeting profile maintained by Google, Meta, TikTok, Amazon, LinkedIn, or any other platform. Unless a platform export explicitly provides a fact, AdSight labels its output as an **AdSight inference** rather than attributing it to that platform.

| Layer | Meaning |
| --- | --- |
| **Observed** | Data you explicitly provide or import. |
| **Inferred** | Categories AdSight calculates from observed signals. |
| **Platform claimed** | Information explicitly contained in a platform-owned export, when available. |

## Privacy architecture

The production design is local-first:

- Core profile and signal storage use SQLite.
- The production database is configured for SQLCipher encryption.
- The SQLCipher key is generated locally and stored with platform secure storage.
- Imports are initiated by the user.
- No scraping, accessibility surveillance, VPN interception, screen scraping, or credential collection is required for the core product.
- Android storage access uses scoped document access rather than broad legacy storage permissions.
- Analytics and advertising SDKs should not be added without an explicit privacy review.

**Privacy claims describe implementation and product intent, not legal certification.** Before publication, verify actual network behavior, permissions, Play Data Safety declarations, and the privacy policy.

## Inference model

AdSight uses a deterministic, evidence-first scoring approach rather than presenting an opaque model as fact.

Signals receive different weights depending on type, recency, repetition, and corroboration. A recent repeated search can provide stronger evidence than an old single signal. Multiple independent signal types can increase corroboration.

Every inference records:

- category score;
- supporting evidence;
- confidence;
- data quality and coverage;
- uncertainty;
- model version.

These values are estimates produced by AdSight. They are not probabilities supplied by an advertising platform and are not a guarantee that an ad will be shown.

## Platform models

The current taxonomy covers Facebook, Instagram, Google, YouTube, TikTok, LinkedIn, and Amazon.

Platform names identify the context being modeled, not access to proprietary targeting systems.

## Production architecture

```text
UI
 ↓
Application services
 ├── profile
 ├── import
 ├── inference
 ├── simulation
 └── history
 ↓
Repositories
 ↓
Encrypted SQLite / SQLCipher

Inference engine
 ├── normalization
 ├── recency
 ├── repetition
 ├── corroboration
 ├── confidence / data quality
 └── evidence graph
```

The app uses Continuous Native Generation. Native configuration is expressed through Expo config plugins so the Android project can be regenerated consistently.

## Development

### Requirements

- Node.js 22.13+
- npm
- Android Studio for local native development
- Expo EAS for cloud builds

Expo SDK 57 targets React Native 0.86 and requires Node.js 22.13.x or newer. Use a development build for native modules such as SQLCipher rather than relying on Expo Go. 

### Install

```bash
git clone https://github.com/mythicavalon/AdSight-Android-App.git
cd AdSight-Android-App
npm install
```

### Run

```bash
npx expo start
```

For Android:

```bash
npm run android
```

For a production APK build through EAS:

```bash
npm run build:android
```

For local release APK validation after native generation:

```bash
npx expo prebuild --clean --platform android
cd android
./gradlew assembleRelease
```

## Test APKs

Every pull request is intended to produce an installable Android release APK through GitHub Actions as the `AdSight-android-preview` artifact, together with a SHA-256 checksum.

The `test-builds/` directory is reserved for explicitly identified release candidates. Routine CI binaries are not committed to source control because doing so makes repository history unnecessarily large.

## Repository structure

```text
AdSight-Android-App/
├── src/
│   ├── components/       # Reusable UI components
│   ├── data/             # Taxonomies and platform mappings
│   ├── intelligence/     # Deterministic inference and evidence model
│   ├── screens/          # App screens
│   ├── services/         # Application services
│   ├── storage/          # Encrypted SQLite repositories and migrations
│   ├── theme/            # UI theme
│   └── types/            # Domain and navigation types
├── docs/                 # Architecture and production decisions
├── test-builds/          # Release-candidate APK convention
├── assets/               # App assets
├── App.tsx               # Application entry point
├── app.json              # Expo configuration
├── eas.json              # EAS build profiles
└── README.md
```

## Production checklist

### Architecture

- [x] Evidence-based inference foundation
- [x] Versioned inference model
- [x] Recency, repetition, corroboration, uncertainty
- [x] SQLite schema and migrations
- [x] SQLCipher configuration
- [x] Secure database-key storage
- [ ] Complete migration of every legacy screen to repositories
- [ ] Snapshot history and diff engine

### Product

- [x] Evidence Explorer foundation
- [ ] Advertising Profile redesign
- [ ] What Changed
- [ ] What If simulations
- [ ] Prediction History
- [ ] Privacy Center
- [ ] User-owned import pipeline hardening

### Quality

- [x] TypeScript CI gate
- [x] Expo dependency and Doctor checks
- [x] Automated Android release APK build
- [ ] Deterministic unit-test suite
- [ ] Import fixture tests
- [ ] Physical-device smoke test matrix
- [ ] Privacy/network regression checks
- [ ] Play Store Data Safety documentation
- [ ] Final privacy policy and legal review

## Design principles

1. **Explain before impressing.** A transparent estimate is more useful than an unexplained percentage.
2. **Uncertainty is a feature.** Weak or contradictory evidence must be visible.
3. **No fabricated integrations.** Never attribute an inference to a platform without source evidence.
4. **Least privilege.** Every permission needs a concrete user-facing reason.
5. **Fast first paint.** Database initialization must not produce a blank screen without feedback.
6. **Recoverable privacy actions.** Deletion and reset flows must explain what will be removed.
7. **Offline resilience.** The core profile and inference experience should work without connectivity.
8. **Test the binary, not only TypeScript.** Every meaningful release candidate must produce an installable APK.

## License

MIT. See `LICENSE`.

---

**AdSight: Private. Local. Explainable.**
