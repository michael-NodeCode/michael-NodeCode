const isProd = process.env.NODE_ENV === 'production';

const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables static export for Tauri compatibility only in production
  output: isProd ? 'export' : undefined, // Don't use export in dev mode

  // Unoptimized images for static export
  images: {
    unoptimized: true,
  },

  // Set assetPrefix for development with Tauri
  assetPrefix: isProd ? '' : `http://${internalHost}:3000`,

  // Allow dynamic routes in dev mode (no redirection needed in dev)
  async redirects() {
    if (isProd) {
      return [
        {
          source: '/node/:id',
          destination: '/node-dynamic.html?id=:id',
          permanent: false,
        },
      ];
    }
    return [];
  },

  // Experimental: force dynamic rendering for certain pages (if supported in your Next.js version)
  experimental: {
    dynamicPageGeneration: true, // Helps ensure dynamic page routing for newer versions
  },
};

export default nextConfig;
