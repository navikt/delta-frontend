/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  i18n: {
    locales: ["nb-NO"],
    defaultLocale: "nb-NO",
    localeDetection: false,
  },
  headers: () => [
    {
      source: "/event/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
