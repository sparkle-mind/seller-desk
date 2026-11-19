/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The landing page moved from /home to /.
    return [{ source: "/home", destination: "/", permanent: true }];
  },
};

module.exports = nextConfig;
