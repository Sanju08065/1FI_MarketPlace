/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // The 1Fi banner is served from their CDN. Product images come from our own
    // API and are rendered with native <img>, so they need no whitelist here.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.1fi.in', pathname: '/**' }],
  },
};

export default nextConfig;
