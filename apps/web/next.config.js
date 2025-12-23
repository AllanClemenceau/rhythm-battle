/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@project/shared"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
}

module.exports = nextConfig
