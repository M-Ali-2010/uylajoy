import { defineConfig } from "nitro";

// Loaded by the nitro Vite plugin alongside the options in vite.config.ts,
// which only exposes the preset. Deployment knobs live here.
export default defineConfig({
  vercel: {
    // A request that has not answered in 30s is stuck (a dead database socket),
    // not slow — fail it fast instead of holding the instance for the
    // platform's 300s maximum.
    functions: { maxDuration: 30 },
  },
});
