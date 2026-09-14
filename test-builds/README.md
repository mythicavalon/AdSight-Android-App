# AdSight test builds

This directory is reserved for explicitly identified release-candidate APKs.

Routine builds are **not** committed to the Git repository because APK binaries make source history large and difficult to maintain. Pull requests build an installable release APK in GitHub Actions and publish it as the `AdSight-android-preview` artifact.

When a release candidate is approved, its APK may be placed here with:

- version and commit SHA
- build date
- SHA-256 checksum
- whether it is debug, internal, or production signed

Never commit signing keys, keystores, passwords, or other credentials to this directory.
