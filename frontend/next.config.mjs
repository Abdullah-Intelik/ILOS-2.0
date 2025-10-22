/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix for Windows browser + WSL app issues
  reactStrictMode: false,
  poweredByHeader: false,
  
  // Configure for cross-OS access (Windows browser → WSL app)
  experimental: {
    esmExternals: false,
  },
  
  // Fix localhost vs 127.0.0.1 cross-origin issues
  allowedDevOrigins: ['localhost', '127.0.0.1', '0.0.0.0'],
  
  // Disable hot reload features that cause spam
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce hot reload frequency for Windows → WSL
      config.watchOptions = {
        poll: 3000,
        aggregateTimeout: 1000,
        ignored: ['**/node_modules/**', '**/.next/**'],
      }
    }
    return config
  },
  
  // Configure dev server for Windows access
  async rewrites() {
    return []
  },
  
  // Fix localhost vs 127.0.0.1 issue
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

export default nextConfig
