/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../../build/client',
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  compress: true,
  poweredByHeader: false
}

module.exports = nextConfig
