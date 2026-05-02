/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Windows/OneDrive: webpack filesystem cache иногда падает на rename *.pack.gz_
    if (dev) config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' }
    ]
  }
};

export default nextConfig;
