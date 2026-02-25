# Fika: Social Connection, Rewired

**Fika** is more than a reminder app. It is a "social health" platform designed for people who want to maintain meaningful relationships without the mental friction of traditional CRMs or the anxiety of high-pressure to-do lists.

We believe that staying in touch should feel like a warm cup of coffee, not a mounting pile of chores.

---

## The Vision
In a world of constant pings and "performance social media," we’ve lost the art of the gentle nudge. Fika restores this by prioritizing **calm design**, **privacy**, and **human-centric interaction**. We don't track "leads"—we nurture connections.

## Core Value Proposition
- **Gentle Intentionality**: Our tone is soft. We don't say "Contact David now." we say "It might feel good to reach out to David."
- **Total Reliability**: Fika is **Offline-First**. Whether you're in a subway or mid-flight, your social graph is accessible and responsive.
- **Zero Friction**: Optimized for one-handed thumb interaction (Mobile-First) with 44px+ tap targets and a bottom-weighted layout.
- **Privacy by Default**: Your data belongs to you. We use LocalStorage for instant response and Supabase solely for secure cross-device sync.

## The Product Pillars

### 1. Calm Aesthetics (The "Fika" Tone)
We avoid bright reds, alarming alerts, and high-pressure copy. Our UI uses warm beiges and soft brown tones to maintain a low-cortisol environment.

### 2. High-Utility "Today" View
Not a dashboard, but a focused lens. Fika shows you who needs your attention today and allows for one-tap "Connected" or "Remind tomorrow" actions.

---

## Technical Strategy
- **Frontend**: React + Vite + TypeScript (Type-safe, fast HMR).
- **Core State**: LocalStorage (Immediate read/write, zero-latency).
- **Persistence**: Supabase (Real-time authenticated sync).
- **Hybrid Mobile**: Capacitor (Web power with native iOS/Android reach).

## How to Build for Fika
We maintain a strict set of **Agent Rules** to ensure the product vision stays consistent. If you are an AI or developer contributing to this project, consult the following:
- [Visual Hierarchy Rules](./.agent/rules/visual-hierarchy.md)
- [Mobile-First Standards](./.agent/rules/mobile-first.md)
- [Project Workflows](./.agent/workflows/new-feature.md)

---

> "Fika is for the people you care about, not the people you work for."
