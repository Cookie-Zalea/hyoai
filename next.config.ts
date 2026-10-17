import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: process.env.NODE_ENV === "production" ? "export" : undefined,
    // The dev-only status pill is Next's UI, not the app's, so it cannot be
    // localized; hide it instead of leaving an English orb in the corner.
    devIndicators: false,
    basePath: process.env.BASE_PATH,
    trailingSlash: true,
    images: { unoptimized: true },
};

export default nextConfig;
