import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import pages from '../src/data/pages.json' with {type:'json'};
const all=['/',...pages.map(p=>'/'+p.slug+'/')];let problems=[];
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
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log('Astro static output verified: '+all.length+' routes, calculator, local price widget, PWA and redirects.');
