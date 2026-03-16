/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // The project uses custom local ESLint rules that are enforced through
    // `npm run lint` / `npm run verify`. Next build should not run a second,
    // incomplete lint pass that cannot load `--rulesdir`.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['supabase.co'],
  },
}

module.exports = nextConfig
