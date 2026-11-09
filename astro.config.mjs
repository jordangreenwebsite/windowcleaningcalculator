import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://windowcleaningcalculator.co.uk',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' }
});
