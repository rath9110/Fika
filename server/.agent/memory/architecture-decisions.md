# Architecture Decisions (ADR)

This file tracks the "Why" behind Fika's technical architecture.

## ADR 1: Offline-First Priority (LocalStorage & Supabase)

**Status:** Accepted
**Context:** Fika is used for social reminders. Users often check it quickly on the go (potential poor connectivity).
**Decision:** 
- `localStorage` is the primary source of truth for the UI.
- All write actions (Mark connected, snooze, add person) must update the local state immediately.
- Supabase is used as a sync layer for authenticated users, not as the primary blocking database.
**Consequences:** 
- The app remains snappy even on 2G/offline.
- We must handle sync conflicts (local usually wins unless a timestamp is significantly newer).

## ADR 2: Capacitor for Mobile
**Status:** Accepted
**Context:** Need for iOS/Android presence with minimal overhead.
**Decision:** Use Capacitor to wrap the React web app.
**Consequences:** Avoid native-only libraries. Ensure all features work in a standard mobile browser environment.
