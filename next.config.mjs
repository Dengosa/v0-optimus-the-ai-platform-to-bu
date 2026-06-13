/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix Turbopack root inference when running from this repo.
  turbopack: {
    root: "./",
  },
};

export default nextConfig;

