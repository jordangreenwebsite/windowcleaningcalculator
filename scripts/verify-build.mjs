import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {legacyRoutes} from '../src/lib/legacy-routes.mjs';

const routes=['',...legacyRoutes];
const errors=[];
let linksChecked=0;
for (const route of routes){
  const sourceFile=join(process.cwd(),route,'index.html');
  const outputFile=join(process.cwd(),'dist',route,'index.html');
  if(!existsSync(outputFile)){errors.push('Missing built page: '+route);continue;}
  const original=readFileSync(sourceFile,'utf8').trim();
  const generated=readFileSync(outputFile,'utf8').trim();
  // The entire document, including original typography, layout DOM,
  // CSS link order and inline calculator, must match the pre-Astro source.
  if(generated!==original){
    let i=0;while(i<Math.min(original.length,generated.length)&&original[i]===generated[i])i++;
    errors.push('Visual source changed on '+(route||'/')+
      '; first byte difference at '+i+' (source '+original.length+', output '+generated.length+')');
  }
  for(const m of original.matchAll(/(?:href|src|srcset)=["']([^"'<>]+)["']/gi)){
    for (const item of m[1].split(',')){
      const url=item.trim().split(/\s+/)[0].split('?')[0];
      if(!url.startsWith('https://windowcleaningcalculator.co.uk/wp-content/'))continue;
      const local=url.slice('https://windowcleaningcalculator.co.uk/'.length);
      linksChecked++;
      if(!existsSync(join('dist',local)))errors.push('Missing original design asset: '+local);
    }
  }
}
for (const file of ['dist/wcc-sw.js','dist/wcc-manifest.webmanifest','dist/sitemap_index.xml','dist/page-sitemap.xml','dist/main-sitemap.xsl','dist/_redirects']){
  if(!existsSync(file))errors.push('Missing original site resource: '+file);
}
const home=existsSync('dist/index.html')?readFileSync('dist/index.html','utf8'):'';
if(!home.includes('id="wcc-app"'))errors.push('Original main calculator markup missing');
if(!home.includes('appsScriptUrl'))errors.push('Google Apps Script calculator code missing');
const lookup=existsSync('dist/window-cleaning-prices-uk/index.html')?readFileSync('dist/window-cleaning-prices-uk/index.html','utf8'):'';
if(!lookup.includes('id="wcpl-app"'))errors.push('Original local pricing checker missing');
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log('Original visual HTML preserved byte-for-byte on '+routes.length+' pages.');
console.log(linksChecked+' original design asset references checked; calculator and local price lookup retained.');
