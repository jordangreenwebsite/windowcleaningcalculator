import {mkdirSync,copyFileSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const root=process.cwd(),pub=join(root,'public');
mkdirSync(pub,{recursive:true});mkdirSync(join(pub,'assets'),{recursive:true});
const assets={
  'wcc-sw.js':'wcc-sw.js',
  'wcc-manifest.webmanifest':'wcc-manifest.webmanifest',
  'wcc-icon-192.png':'wcc-icon-192.png',
  'wcc-icon-512.png':'wcc-icon-512.png',
  'wcc-apple-touch-icon.png':'wcc-apple-touch-icon.png',
  'assets/logo.png':'wp-content/uploads/2026/08/Window-Cleaning-Calculator-Small-Logo-Transparent-150x150.png'
};
for(const [target,source] of Object.entries(assets)){
  const from=join(root,source),to=join(pub,target);
  if(!existsSync(from))throw new Error('Missing required legacy asset: '+source);
  if(target==='wcc-sw.js') {
    // Force clients of the old WordPress export to refresh cached site assets on migration.
    const sw=readFileSync(from,'utf8').replace(/wcc-pwa-v1\.4\.1/g,'wcc-pwa-v2.0.0-astro');
    writeFileSync(to,sw);
  } else copyFileSync(from,to);
}
console.log('Prepared '+Object.keys(assets).length+' local icon/PWA assets.');
