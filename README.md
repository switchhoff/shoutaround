# Shout

A shared tab app for groups — create or join a tab for a round, track who's shouting, and settle up at the end. Built with Expo (React Native) and Firebase.

## Features

- **Create a tab** — start a new round and invite friends
- **Join a tab** — join an existing tab via code or link
- **Tab tracking** — see who's shouted and who's up next
- **Onboarding** — quick setup with display name and avatar emoji

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo (React Native) |
| Router | Expo Router (file-based) |
| Backend | Firebase Firestore + Auth |
| Language | TypeScript |
| Location | expo-location |

## Getting Started

```bash
npm install
npx expo start        # opens Expo Go / simulator
npx expo start --ios
npx expo start --android
```

Requires a Firebase project configured in `lib/firebase.ts`.

## Project Structure

```
app/
  (tabs)/
    index.tsx       # Home — your active tabs
    create-tab.tsx  # Create a new tab
  join.tsx          # Join an existing tab
  onboarding.tsx    # First-run setup
components/
  TabCard.tsx
hooks/
  useAuth.ts
  useTab.ts
lib/
  firebase.ts
```
