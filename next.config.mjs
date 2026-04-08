/** @type {import('next').NextConfig} */
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isProjectPagesBuild =
  process.env.GITHUB_ACTIONS === 'true' &&
  repository &&
  !repository.endsWith('.github.io');

// GitHub Pages project sites use /{repo} on *.github.io, but a custom apex domain
// serves the same build at site root — use GITHUB_PAGES_BASE_PATH="" in CI for that.
const explicitBase = process.env.GITHUB_PAGES_BASE_PATH;
const basePath =
  explicitBase !== undefined
    ? explicitBase
    : isProjectPagesBuild
      ? `/${repository}`
      : '';

const nextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/hooks': './src/hooks',
      '@/config': './src/config',
    };
    return config;
  },
};

export default nextConfig;
