/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
      // future e ekhane tomar real image host add korba, e.g.:
      // { protocol: 'https', hostname: 'res.cloudinary.com' },
      // { protocol: 'https', hostname: 'your-bucket.s3.amazonaws.com' },
    ],
  },
};

export default nextConfig;
