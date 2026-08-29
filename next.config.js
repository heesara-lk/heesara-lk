/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ['syljkbrsaiwtvczaitug.supabase.co'],
  },
}
module.exports = nextConfig
