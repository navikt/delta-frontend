/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['axios'],
  async redirects() {
    return [
      {
        source: '/psykiskhelse',
        destination: '/event/1b9783d3-c8d6-4131-ac01-46c3dab3f9ea',
        permanent: true,
      },
      {
        source: '/faggrupper/faggruppe-design-av-fagsystemer',
        destination: '/faggrupper/88ae4787-4279-4604-9800-2c69ad228e4b',
        permanent: true,
      },
    ]
  },
  cacheComponents: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    optimizePackageImports: ["@navikt/ds-react", "@navikt/aksel-icons"],
  },
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
});

module.exports = withMDX(nextConfig);
