/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async redirects() {
    // The landing page moved from /home to /.
    return [{ source: "/home", destination: "/", permanent: true }];
  },
};

module.exports = nextConfig;
