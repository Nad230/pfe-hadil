/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Enable Server Actions
    appDir: true, // Ensure app directory works inside src/
  },
};
module.exports = {
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig;
