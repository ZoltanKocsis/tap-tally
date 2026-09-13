# TapTally

A simple, local-first Android app for counting anything, once a tap at a time — push-ups, cigarettes, glasses of water, whatever you decide to track. Built with [Expo](https://expo.dev) (React Native + TypeScript). All data stays on your phone in a local SQLite database; nothing is sent anywhere unless you export it yourself.

## Features

- One-tap **+1** counter, with a **Cancel +1** to undo a mis-tap
- Today's log, with per-entry delete
- **This Week / This Month / This Year / All Together** bar charts
- Rename what you're counting anytime, in Settings
- **Start over** to wipe all data
- **Export to CSV or Excel (.xlsx)** from Settings

## Developing in GitHub Codespaces (no local install needed)

This repo is set up to develop entirely in the browser via [GitHub Codespaces](https://github.com/features/codespaces) — no local Node, Android Studio, or Xcode required.

1. On the repo's GitHub page: **Code → Codespaces → Create codespace on main**.
2. Wait for the container to build — it runs `npm install` automatically.
3. In the Codespace terminal, start the dev server in tunnel mode:

   ```bash
   npm run tunnel
   ```

   Tunnel mode is required because your phone and the Codespace aren't on the same network — it routes the connection over the internet so there's no CDN-style caching delay to wait out.

4. Install **[Expo Go](https://expo.dev/go)** from the Play Store on your Android phone.
5. Scan the QR code printed in the terminal with the Expo Go app.
6. Edit any file in `src/` and save — the app on your phone reloads automatically, usually within a second or two.

No build step, no waiting on GitHub Pages/CDN — this is a live dev server, so changes show up almost instantly.

## Project structure

```
src/
  app/            screens (file-based routing via expo-router)
    index.tsx        Home screen
    onboarding.tsx    first-launch "what are you counting?" screen
    settings.tsx      rename / export / start over
    history/[period].tsx   week / month / year / all bar chart
  components/     BarChart, Logo
  lib/
    db.ts           SQLite data layer
    aggregate.ts    turns raw entries into chart data
    export.ts       CSV / XLSX export
    format.ts       date/time formatting
    theme.ts        colors, spacing, type scale
```

## Building an installable APK

Codespaces + Expo Go is great for development, but to install TapTally as a normal app icon on your phone (no Expo Go needed), build with [EAS Build](https://docs.expo.dev/build/introduction/) — it has a free tier and runs in the cloud, so it doesn't need anything installed locally either:

```bash
npx eas-cli build --platform android --profile preview
```

Follow the prompts (free Expo account required); EAS gives you a link to download the finished `.apk`.
