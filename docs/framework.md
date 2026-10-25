# Framework

**Vite + Svelte + TypeScript**, with MapLibre GL JS for the map.

- **Svelte** builds the screens (departure, time dial, globe, aircraft, seat, flight, history). Each screen is one file holding its layout, style and behaviour. It produces small, fast pages, which keeps the slow, smooth animations easy on laptops and tablets.
- **TypeScript** is JavaScript that checks itself: mistakes such as passing a distance where a time was expected show up before the app runs.
- **Vite** runs the app locally while it's being built (changes appear instantly) and packs it into plain files for GitHub Pages.
- **MapLibre GL JS** is a plain JavaScript library, so it works inside Svelte without a wrapper.

Alternatives considered:

- **React:** the most common choice, but heavier, with more code for the same screens.
- **No framework:** fine for one screen, but nine steps of ritual would mean hand-managing a lot of state.

If the app goes public as a native app later, Svelte apps can be wrapped with Capacitor or Tauri.
