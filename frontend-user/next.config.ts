/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bd-craft-ecommerce.onrender.com",
      },
    ],
  },
};

export default nextConfig;
