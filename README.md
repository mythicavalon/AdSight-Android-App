# AdSight

**See what advertisers can infer about you.**

AdSight is a privacy-first Android app for exploring advertising interests and audience categories that can be inferred from data you choose to provide.

> **Private. Local. Explainable.**

## What AdSight does

AdSight turns user-provided signals into transparent, evidence-backed advertising inferences. It helps you understand how ordinary activity can contribute to an advertising profile without pretending to have access to private advertiser systems.

### Core capabilities

- **Advertising profile**: See categories AdSight infers from your signals.
- **Evidence**: Understand which signals contributed to an inference.
- **Confidence and uncertainty**: Distinguish stronger evidence from weaker or incomplete evidence.
- **Platform views**: Explore platform-specific prediction models without claiming access to internal targeting data.
- **What changed**: Track how your inferred profile changes as your data changes.
- **What if?**: Experiment with hypothetical signals before adding them to your real profile.
- **Data import**: Bring in data exports you own and choose to analyze.
- **Privacy controls**: Keep your profile local and control what you provide.

## Important distinction

AdSight is an **inference and education tool**, not an advertiser API.

It does not claim to know the private targeting profile maintained by Google, Meta, TikTok, Amazon, LinkedIn, or any other platform. Unless a platform export explicitly provides a fact, AdSight labels its output as an **AdSight inference** rather than attributing it to that platform.

Signals are kept separate from conclusions:

| Layer | Meaning |
| --- | --- |
| **Observed** | Data you explicitly provide or import. |
| **Inferred** | Categories AdSight calculates from observed signals. |
| **Platform claimed** | Information explicitly contained in a platform-owned export, when available. |

## Privacy by design

AdSight is built around local-first processing.

- No account is required for the core experience.
- User-provided profile data is intended to remain on the device.
- Data import is initiated by the user.
- No scraping, accessibility surveillance, VPN interception, or screen scraping is required for the core product.
- Android storage access should use scoped document access instead of broad legacy storage permissions.
- Analytics and advertising SDKs should not be added without an explicit privacy review.

**Privacy claims in this repository describe product intent and implementation targets, not legal advice or a certification.** Verify actual network behavior, permissions, Play Data Safety declarations, and the privacy policy before publishing a release.

## How the inference model works

AdSight uses a transparent scoring approach rather than presenting an opaque model as fact.

Signals can receive different weights depending on type, recency, repetition, and corroboration. A recent repeated search can provide stronger evidence than an old single signal. Multiple independent signals pointing toward the same category can increase evidence strength.

A prediction should expose:

- category score;
- supporting evidence;
- model confidence;
- data quality and coverage;
- model version.

These values are estimates produced by AdSight. They are not probabilities supplied by an advertising platform and are not a guarantee that an ad will be shown.

## Supported platform models

The current product includes models for Facebook, Instagram, Google, YouTube, TikTok, LinkedIn, and Amazon.

Platform models are heuristic and educational unless backed by user-provided platform data. Platform names identify the context being modeled, not access to proprietary targeting systems.

## V2 architecture

V2 separates the user interface, application services, data storage, and inference system:

```text
UI
 ↓
Application services
 ↓
Signal repository
 ↓
Inference engine
 ├── feature extraction
 ├── recency weighting
 ├── scoring
 ├── confidence calibration
 └── explanations
 ↓
History / evidence
```

Structured profile and signal data is being moved toward SQLite-based storage. Encryption is planned for production database storage where supported. Small secrets should use secure platform storage rather than general-purpose key-value storage.

## Project status

AdSight is under active V2 development. The repository contains the working V1 application plus foundations for a more rigorous local inference architecture.

The priority is **trustworthy product behavior over exaggerated AI claims**: clear evidence, reproducible scoring, useful explanations, safe data handling, and reliable builds.

## Development

### Requirements

- Node.js compatible with the selected Expo SDK
- npm
- Android Studio for native Android development
- Expo EAS for cloud builds

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

For a production Android build:

```bash
npm run build:android
```

> Native modules used by later V2 milestones may require an Expo development build rather than Expo Go.

## Repository structure

```text
AdSight-Android-App/
├── src/
│   ├── components/       # Reusable UI components
│   ├── data/             # Taxonomies and platform mappings
│   ├── screens/           # App screens
│   ├── services/         # Application services
│   ├── theme/            # UI theme
│   └── types/             # TypeScript types
├── assets/                # App assets
├── App.tsx                # Application entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── eas.json               # EAS build profiles
└── README.md
```

## Roadmap

### V2 foundation

- [x] Establish evidence-based inference direction
- [x] Define normalized signal and inference model
- [x] Define recency-aware scoring
- [ ] Complete SQLite migration
- [ ] Add encrypted local database for production builds
- [ ] Add model versioning and calibration

### Product

- [ ] Advertising Profile
- [ ] Evidence Explorer
- [ ] What Changed
- [ ] What If simulations
- [ ] Prediction History
- [ ] Prediction feedback and evaluation
- [ ] Privacy Center
- [ ] Improved user-owned data imports

### Production

- [ ] Automated TypeScript and lint checks
- [ ] Unit and integration test coverage
- [ ] Android release validation
- [ ] Privacy/network regression checks
- [ ] Accurate Play Store Data Safety documentation
- [ ] Final privacy policy and legal review

## Contributing

Issues and pull requests are welcome. Please keep the local-first privacy model intact and avoid adding telemetry, advertising SDKs, data uploads, scraping, or surveillance-style collection without a documented privacy review.

## License

MIT. See `LICENSE`.

---

**AdSight: Private. Local. Explainable.**
