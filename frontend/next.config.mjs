/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // React Compiler: automatically memoises every component and hook.
  // Replaces manual useMemo/useCallback and catches cases we missed.
  // Same behaviour, fewer re-renders, zero code changes needed in components.
  experimental: {
    reactCompiler: true,
  },
  images: {
    // The 1Fi banner is served from their CDN. Product images come from our own
    // API and are rendered with native <img>, so they need no whitelist here.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.1fi.in', pathname: '/**' }],
  },
};

export default nextConfig;
