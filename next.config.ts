import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the workspace root to THIS project. Without it, Turbopack infers the
    // root from the stray package-lock.json in C:\wamp64\www and watches every
    // sibling WAMP project, which churns the file-watcher into an endless
    // "Compiling…" / reload loop.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
