/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: ['@plantao/shared', '@plantao/notifications', '@plantao/backend'],
};

export default nextConfig;
