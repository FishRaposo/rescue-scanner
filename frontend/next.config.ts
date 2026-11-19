import type { NextConfig } from "next";

// Static export for the GitHub Pages demo. The base path matches where Pages
// serves the repo (/rescue-scanner); local dev keeps it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(basePath === ""
    ? {}
    : { basePath: `/${basePath.replace(/^\/+|\/+$/g, "")}` }),
};

export default config;
