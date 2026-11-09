import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {legacyRoutes} from '../src/lib/legacy-routes.mjs';

const BASE='https://windowcleaningcalculator.co.uk';
const routes=['',...legacyRoutes], errors=[], titles=new Map(), descriptions=new Map();
let checkedImages=0, linksChecked=0, schemaChecked=0, correctedHeadings=0;
const read=f=>readFileSync(f,'utf8');
const stripScripts=s=>s.replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)\s*>/gi,'');
const body=s=>s.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1]||'';
const displayedText=s=>stripScripts(body(s).replace(/<h1 class="seo-accessible-title">[\s\S]*?<\/h1>/gi,''))
  .replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const externalScripts=s=>[...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
  .filter(x=>!/application\/ld\+json/i.test(x[1]))
  .map(x=>({attrs:x[1],content:x[2]}));
const cssLinks=s=>[...s.matchAll(/<link\b[^>]*>/gi)]
  .map(x=>x[0]).filter(x=>/\brel=["']stylesheet["']/i.test(x));

for(const route of routes){
 const path='/'+(route?route+'/':'');
 const sourceFile=join(process.cwd(),route,'index.html'), outputFile=join(process.cwd(),'dist',route,'index.html');
 if(!existsSync(outputFile)){errors.push('Missing page: '+path);continue;}
 const original=read(sourceFile),rendered=read(outputFile);
 if(displayedText(original)!==displayedText(rendered))errors.push('Visible text changed on '+path);
 if(JSON.stringify(externalScripts(original))!==JSON.stringify(externalScripts(rendered)))errors.push('Original interactive scripts changed on '+path);
 if(JSON.stringify(cssLinks(original))!==JSON.stringify(cssLinks(rendered)))errors.push('Original CSS stylesheets changed on '+path);
 const clean=stripScripts(rendered);
 const h1s=[...clean.matchAll(/<h1\b[^>]*>/gi)].length;
 if(h1s!==1)errors.push(path+' expected one H1, got '+h1s);
 else correctedHeadings++;
 const title=(rendered.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'';
 const meta=rendered.match(/<meta name="description" content="([^"]*)">/i);
 if(!title||!meta?.[1])errors.push(path+' missing title or description');
 if(titles.has(title))errors.push('Duplicate title: '+title+' at '+path+' and '+titles.get(title));
 if(meta?.[1]&&descriptions.has(meta[1]))errors.push('Duplicate description '+path+' and '+descriptions.get(meta[1]));
 titles.set(title,path);if(meta?.[1])descriptions.set(meta[1],path);
 const canonical=BASE+path;
 if(!rendered.includes('rel="canonical" href="'+canonical+'"'))errors.push('Bad canonical '+path);
 if(!rendered.includes('property="og:image"'))errors.push('Missing OG logo '+path);
 if(!rendered.includes('name="twitter:image"'))errors.push('Missing Twitter logo '+path);
 if(!rendered.includes('rel="icon" type="image/png" sizes="192x192" href="/wcc-icon-192.png"'))errors.push('Missing favicon '+path);
 const schema=rendered.match(/<script type="application\/ld\+json" data-wcc-seo="true">([\s\S]*?)<\/script>/i);
 if(!schema)errors.push('No modern schema on '+path);
 else {
  try{
   const parsed=JSON.parse(schema[1]);
   if(parsed['@context']!=='https://schema.org'||!Array.isArray(parsed['@graph']))errors.push('Invalid schema graph '+path);
   if(parsed['@graph']?.some(x=>String(x.url||'').includes('.local')))errors.push('Local dev schema URL '+path);
   schemaChecked++;
  }catch(e){errors.push('Unparseable JSON-LD '+path+': '+e.message)}
 }
 if(/windowcleaningcalculator\.local/i.test(stripScripts(rendered)))errors.push('Stale local domain '+path);
 const imgs=[...clean.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]);
 for(const img of imgs){
  if(!/\balt\s*=/i.test(img))errors.push('Image missing alt '+path+' '+img.slice(0,95));
  checkedImages++;
 }
 const htmlLinks=[...clean.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m=>m[1]);
 for(const link of htmlLinks){
  if(link.startsWith('http://'))errors.push('Insecure HTTP link '+path+': '+link);
  if(!link.startsWith(BASE+'/')&&!link.startsWith('/'))continue;
  const pathname=(link.startsWith(BASE)?link.slice(BASE.length):link).split(/[?#]/)[0];
  if(!pathname||pathname==='/')continue;
  if(/\.(?:png|jpe?g|webp|svg|woff2?|css|js|xml|pdf|webmanifest)$/i.test(pathname)){
   if(!existsSync(join('dist',pathname)))errors.push('Broken asset link '+path+' -> '+pathname);
   continue;
  }
  linksChecked++;
  const target=join('dist',pathname,'index.html');
  if(!existsSync(target))errors.push('Broken page link '+path+' -> '+pathname);
 }
 for(const m of original.matchAll(/(?:href|src|srcset)=["']([^"'<>]+)["']/gi)){
  for(const item of m[1].split(',')){
   const url=item.trim().split(/\s+/)[0].split('?')[0];
   if(!url.startsWith(BASE+'/wp-content/'))continue;
   const local=url.slice(BASE.length+1);
   if(!existsSync(join('dist',local)))errors.push('Missing design asset '+path+' -> '+local);
  }
 }
}
for(const file of ['dist/wcc-sw.js','dist/wcc-manifest.webmanifest','dist/sitemap.xml',
 'dist/wcc-icon-192.png','dist/wcc-icon-512.png','dist/wcc-apple-touch-icon.png','dist/_redirects','dist/robots.txt']){
 if(!existsSync(file))errors.push('Missing required asset '+file);
}
const home=existsSync('dist/index.html')?read('dist/index.html'):'';
if(!home.includes('id="wcc-app"')||!home.includes('appsScriptUrl'))errors.push('Calculator or Google Apps Script integration missing');
const guide=existsSync('dist/window-cleaning-prices-uk/index.html')?read('dist/window-cleaning-prices-uk/index.html'):'';
if(!guide.includes('id="wcpl-app"'))errors.push('Local price checker missing');
const robots=read('dist/robots.txt');
if(!/User-agent:\s*\*/i.test(robots)||!/Allow:\s*\//i.test(robots)||/Disallow:\s*\/(?:\s|$)/i.test(robots))errors.push('robots.txt does not allow crawling');
const sitemap=read('dist/sitemap.xml');
for(const route of ['',...legacyRoutes.filter(r=>!r.startsWith('author/'))]){
 const uri=BASE+'/'+(route?route+'/':'');
 if(!sitemap.includes('<loc>'+uri+'</loc>'))errors.push('Sitemap missing '+uri);
}
if(sitemap.includes('/author/windowcleaningcalculator/'))errors.push('Placeholder author archive in sitemap');
const reds=read('dist/_redirects');
for(const route of ['/home/','/window-cleaning-cost-per-window/','/inside-window-cleaning-cost/']){
 if(!reds.includes(route))errors.push('Legacy redirect missing '+route);
}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log('SEO verification passed on '+routes.length+' Astro pages: '+correctedHeadings+
 ' unique-H1 pages, '+checkedImages+' images with alt attributes, '+schemaChecked+' schema graphs and '+linksChecked+' internal page links.');
console.log('Original visible text, CSS link order, and interactive scripts preserved on all pages.');
