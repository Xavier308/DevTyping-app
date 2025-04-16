export default {
  plugins: {
    '@tailwindcss/postcss': {
      layers: ['tw.preflight', 'tw.base', 'tw.components', 'tw.utilities'],
    },
    autoprefixer: {},
  },
}