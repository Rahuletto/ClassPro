import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import path from "path";
const withSerwist = withSerwistInit({
        swSrc: "app/sw.ts",
        swDest: "public/sw.js",
        disable: process.env.NODE_ENV === "development",
        cacheOnNavigation: true,
        dontCacheBustURLsMatching:
                /^dist\/static\/([a-zA-Z0-9]+)\.([a-z0-9]+)\.(css|js)$/,
        exclude: [
                /\.map$/,
                /asset-manifest\.json$/,
                /LICENSE/,
                /README/,
                /robots.txt/,
        ],
        reloadOnOnline: true,
});
const nextConfig: NextConfig = {
        poweredByHeader: false,
        compress: true,
        images: {
                formats: ['image/webp', 'image/avif'],
                minimumCacheTTL: 7200,
        },
        output: 'standalone',
        turbopack: {},
        reactCompiler: true,
        experimental: {
                nextScriptWorkers: true,
                viewTransition: true,
                staticGenerationMaxConcurrency: 8,
        },
        async headers() {
                return [
                        {
                                source: '/(.*)',
                                headers: [
                                        {
                                                key: 'Cache-Control',
                                                value: 'public, max-age=3600, stale-while-revalidate=86400',
                                        },
                                ],
                        },
                        {
                                source: '/api/(.*)',
                                headers: [
                                        {
                                                key: 'Cache-Control',
                                                value: 'public, max-age=300, stale-while-revalidate=600',
                                        },
                                ],
                        },
                ];
        },
};
export default withSerwist(nextConfig);
