/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  i18n: {
    locales: ["nb-NO"],
    defaultLocale: "nb-NO",
    localeDetection: false,
  },
  async redirects() {
    return [
      {
        source: '/psykiskhelse',
        destination: '/event/1b9783d3-c8d6-4131-ac01-46c3dab3f9ea',
        permanent: true,
      },
    ]
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

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  optimizePackageImports: ["@navikt/ds-react", "@navikt/aksel-icons"]
});

module.exports = nextConfig;
