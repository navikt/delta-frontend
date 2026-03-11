/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Aksel v8 provides its own CSS reset via @layer aksel.reset.
  // Tailwind's preflight is unlayered and would override Aksel's layered styles,
  // breaking heading font sizes and form field decorations.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      // Restore standard Tailwind colors removed by @navikt/ds-tailwind v8 preset
      colors: {
        white: '#ffffff',
        black: '#000000',
        transparent: 'transparent',
        current: 'currentColor',
        ...require('tailwindcss/colors'),
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  presets: [require('@navikt/ds-tailwind')]
}
