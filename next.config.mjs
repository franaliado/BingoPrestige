/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.build',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
