import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import pages from '../src/data/pages.json' with {type:'json'};
const newGuide='/window-cleaning-prices-uk/how-often-should-windows-be-cleaned/';
const all=['/',newGuide,...pages.map(p=>'/'+p.slug+'/')];let problems=[];
for(const path of all){
 const file=join('dist',path,'index.html'),html=existsSync(file)?readFileSync(file,'utf8'):'';
 if(!html){problems.push('Missing '+file);continue;}
 const document=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 if((document.match(/<h1\b/gi)||[]).length!==1)problems.push(path+' must have exactly one H1');
 const expected='https://windowcleaningcalculator.co.uk'+path;
 if(!html.includes('rel="canonical" href="'+expected+'"')&&!html.includes('href="'+expected+'" rel="canonical"'))problems.push(path+' lacks canonical '+expected);
 if(/wp-content\/plugins\/breakdance|simply-static/i.test(document))problems.push(path+' still outputs WordPress vendor references');
}
for(const p of ['dist/wcc-sw.js','dist/wcc-manifest.webmanifest','dist/sitemap.xml','dist/_redirects']){
 if(!existsSync(p))problems.push('Missing '+p);
}
for(const file of ['dist/index.html','dist/window-cleaning-prices-uk/index.html']){
 const html=existsSync(file)?readFileSync(file,'utf8'):'';
 if(file==='dist/index.html'&&!html.includes('id="wcc-app"'))problems.push('Missing main calculator in output');
 if(file!=='dist/index.html'&&!html.includes('id="wcpl-app"'))problems.push('Missing local price widget in output');
}
const sitemap=readFileSync('dist/sitemap.xml','utf8');
if(!sitemap.includes('<loc>https://windowcleaningcalculator.co.uk'+newGuide+'</loc>')) problems.push('New frequency guide missing from XML sitemap');
const htmlHome=readFileSync('dist/index.html','utf8');
if(!htmlHome.includes('href="'+newGuide+'"')) problems.push('New guide is not linked from homepage');
const guideHtml=readFileSync(join('dist',newGuide,'index.html'),'utf8');
for (const word of ['Every 4 weeks','Every 6 weeks','Every 8 weeks','Every 12 weeks','One-off clean']) {
 if(!guideHtml.includes(word)) problems.push('New guide is missing '+word);
}
const header=readFileSync('src/components/SiteHeader.astro','utf8');
if(!header.includes("how-often-should-windows-be-cleaned/")) problems.push('New guide is not in navigation');
if(problems.length){console.error(problems.join('\\n'));process.exit(1);}
console.log('Astro static output verified: '+all.length+' routes, calculator, local price widget, PWA and redirects.');
