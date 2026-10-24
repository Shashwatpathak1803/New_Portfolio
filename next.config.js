/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // hides the floating Next.js dev badge / issue notifier
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
