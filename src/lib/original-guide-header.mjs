import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {legacyRoutes} from './legacy-routes.mjs';

// Extract the actual production header on every build, not a hand-drawn substitute.
const home=readFileSync(join(process.cwd(),'index.html'),'utf8');
const base='https://windowcleaningcalculator.co.uk';
const rawHeader=home.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
if(!rawHeader)throw Error('Original calculator header not found');
const linkTags=[...home.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(m=>m[0]);
const styles=linkTags.filter(tag=>/normalize\.min\.css|awesome-menu\.css|fonts\.googleapis|post-17-defaults\.css|global-settings\.css|post-17\.css/.test(tag)).join('\n');
const blocks=[...home.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].map(m=>m[0]);
const deps=blocks.filter(tag=>/^<script src=/.test(tag)&&/breakdance-utils\.js|header-builder\.js|awesome-menu\.js/.test(tag));
const setup=blocks.filter(tag=>/window\.BreakdanceFrontend\.data\s*=|new BreakdanceHeaderBuilder\(|new AwesomeMenu\(/.test(tag)).map(tag=>tag.replace(/http:\\\/\\\/windowcleaningcalculator\.local/g,'https:\\/\\/windowcleaningcalculator.co.uk'));
if(deps.length!==3||setup.length!==3||styles.split('\n').length!==6)throw Error('Original calculator header assets changed; review needed');
const pricingChildren=legacyRoutes.filter(p=>p.startsWith('window-cleaning-prices-uk/'));
const fixes=new Map(pricingChildren.map(p=>['/'+p.split('/').pop()+'/','/'+p+'/']));
let header=rawHeader.replace(/<\/?h1\b/gi,tag=>tag.replace(/h1/i,'h2'))
 .replace(/(\bhref=)(["'])([^"']+)\2/gi,(all,start,quote,href)=>{
  if(href==='#calculator')return start+quote+'/#calculator'+quote;
  if(href===base+'/home/'||href==='/home/')return start+quote+'/'+quote;
  const path=href.startsWith(base)?href.slice(base.length):href;
  return fixes.has(path)?start+quote+fixes.get(path)+quote:all;
 });
header=header.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi,tag=>{
 const label=tag.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 if(label==='Guides')return tag.replace(/(\bhref=)(["'])[^"']*\2/i,'$1"/guides/"').replace('data-type=""','data-type="url"');
 if(label==='For Window Cleaners')return tag.replace(/(\bhref=)(["'])[^"']*\2/i,'$1"/guides/#for-window-cleaners"').replace('data-type=""','data-type="url"');
 return tag;
}).replace(/<img\b[^>]*>/gi,tag=>{
 const updated=tag.replace(/Logo-in-circle\.png/g,'Logo-in-circle-300x300.png');
 return /(?:\s)alt\s*=/.test(updated)?updated:updated.replace(/>$/,' alt="Window Cleaning Calculator">');
});
export const originalGuideHeader=header;
export const originalGuideHeaderStyles=styles;
export const originalGuideHeaderScripts=[...deps,...setup].join('\n');
