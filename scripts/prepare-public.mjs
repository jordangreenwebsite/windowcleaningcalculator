import {cpSync, mkdirSync, copyFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const root=process.cwd(), pub=join(root,'public');
mkdirSync(pub,{recursive:true});

// The pre-migration site's original visual assets. Preserve all exact CSS,
// images and small Breakdance runtime files while an Astro-native component
// decomposition is performed behind a pixel-parity gate.
const assetFolders=[
  'wp-content/uploads',
  'wp-content/plugins/breakdance'
];
for (const source of assetFolders) {
  const from=join(root,source),to=join(pub,source);
  if (!existsSync(from)) throw new Error('Missing original design assets: '+source);
  cpSync(from,to,{recursive:true,force:true});
}
// Original sitemap presentation and PWA assets.
const individual=[
  'wcc-manifest.webmanifest','wcc-icon-192.png',
  'wcc-icon-512.png','wcc-apple-touch-icon.png',
  'sitemap_index.xml','page-sitemap.xml','main-sitemap.xsl'
];
for (const source of individual) {
  if (!existsSync(join(root,source))) throw new Error('Missing original asset: '+source);
  copyFileSync(join(root,source),join(pub,source));
}
const sw=readFileSync(join(root,'wcc-sw.js'),'utf8')
  .replace(/wcc-pwa-v1\.4\.1/g,'wcc-pwa-v2.2.0-seo');
writeFileSync(join(pub,'wcc-sw.js'),sw);
console.log('Original site assets, CSS, PWA and sitemap resources prepared.');
