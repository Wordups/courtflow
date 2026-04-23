# App Store Readiness

## Required Before TestFlight

- Apple Developer Program account.
- Bundle identifier, likely `com.takeoff.courtflow` or similar.
- Privacy policy URL.
- Terms URL.
- App icon and screenshots.
- Real support URL.
- Accurate App Store privacy labels.
- Account deletion flow if accounts are enabled.
- Backend/proxy for AI and sync.

## Prototype Hardening Checklist

- Save onboarding sport to canonical `sport` key.
- Remove direct client-side LLM provider calls.
- Safely render user-controlled text.
- Validate drill links as `https://` URLs.
- Hide global nav/FAB on full-screen session summary.
- Show note visibility controls only for notes.
- Fix duplicated AI chat message flow.
- Rename conflicting `.dn` class.
- Remove `.xlsx` UI support until real parsing exists.
- Make session summary sport-aware.
