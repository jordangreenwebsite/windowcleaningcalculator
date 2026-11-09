import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {legacyRoutes} from '../src/lib/legacy-routes.mjs';

// SEO-only post-processing of Astro's static output. The original exported
// markup and styles remain authoritative and are never edited by this script.
const BASE='https://windowcleaningcalculator.co.uk';
const IMAGE=BASE+'/wp-content/uploads/2026/08/Window-Cleaning-Calculator-Full-Logo-with-background-square.png';
const BRAND='Window Cleaning Calculator';
const EMAIL='uktradewebsites@gmail.com'; // published in the site's existing privacy policy
const POLICY={
 'privacy-policy':{
  title:'Privacy Policy | Window Cleaning Calculator',
  description:'Read how Window Cleaning Calculator handles postcode and estimate data, requested emails and optional marketing consent, and how to contact us.'
 },
 'terms-of-use':{
  title:'Terms of Use | Window Cleaning Calculator',
  description:'Read the terms for using our free UK window cleaning price calculator, including estimates, accuracy, quotations and your responsibilities.'
 },
 'cookie-policy':{
  title:'Cookie Policy | Window Cleaning Calculator',
  description:'Learn how Window Cleaning Calculator uses cookies and browser storage, which third-party services support the tool and how to manage settings.'
 },
 'cookie-settings':{
  title:'Cookie Settings | Window Cleaning Calculator',
  description:'See how Window Cleaning Calculator uses essential browser storage, manages cookie preferences and explains optional tracking technologies.'
 },
 'author/windowcleaningcalculator':{
  title:'News and Articles | Window Cleaning Calculator',
  description:'Window cleaning articles and guidance from Window Cleaning Calculator. Explore the UK pricing guides and our free price estimate tool.'
 }
};
const LINK_MAP={
 '/home/':'/',
 '/window-cleaning-cost-per-window/':'/window-cleaning-prices-uk/window-cleaning-cost-per-window/',
 '/window-cleaning-prices-by-property-type/':'/window-cleaning-prices-uk/window-cleaning-prices-by-property-type/',
 '/first-window-cleaning-cost/':'/window-cleaning-prices-uk/first-window-cleaning-cost/',
 '/one-off-window-cleaning-cost/':'/window-cleaning-prices-uk/one-off-window-cleaning-cost/',
 '/inside-window-cleaning-cost/':'/window-cleaning-prices-uk/inside-window-cleaning-cost/',
 '/conservatory-cleaning-cost/':'/window-cleaning-prices-uk/conservatory-cleaning-cost/',
 '/conservatory-roof-cleaning-cost/':'/window-cleaning-prices-uk/conservatory-roof-cleaning-cost/',
 '/window-cleaning-prices-by-area/':'/window-cleaning-prices-uk/window-cleaning-prices-by-area/',
 '/how-we-calculate-prices/':'/window-cleaning-prices-uk/how-we-calculate-prices/'
};
const MANAGED=new Set([
 'description','robots','author','googlebot',
 'og:locale','og:type','og:title','og:description','og:url','og:site_name',
 'og:image','og:image:secure_url','og:image:alt','og:image:width','og:image:height','og:image:type',
 'twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt',
 'article:published_time','article:modified_time'
]);
const escapeHtml=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const tagText=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const meta=(name,value,key='name')=>'<meta '+key+'="'+name+'" content="'+escapeHtml(value)+'">';
const originalValue=(html,key,value)=>{
 const tags=[...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);
 const search1=(key+'="'+value+'"').toLowerCase();
 const search2=(key+"='"+value+"'").toLowerCase();
 const found=tags.find(x=>x.toLowerCase().includes(search1)||x.toLowerCase().includes(search2));
 return found?.match(/\bcontent=["']([^"']*)["']/i)?.[1]||'';
};
function imageAlt(src){
 if(/arrow-down-icon\./i.test(src))return '';
 if(/UK-TRADE-WEbsites/i.test(src))return 'UK Trade Websites logo';
 if(/Screenshot-2026/i.test(src))return 'Screenshot showing a window cleaning pricing example';
 if(/Logo-in-circle/i.test(src))return '';
 if(/Window-Cleaning-Calculator/i.test(src))return 'Window Cleaning Calculator logo';
 throw new Error('Unrecognised image requiring a manual alt-text review: '+src);
}
function outsideScripts(markup,fn) {
 const protectedBlock=/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)\s*>/gi;
 let result='',cursor=0,match;
 while((match=protectedBlock.exec(markup))){
  result+=fn(markup.slice(cursor,match.index))+match[0];
  cursor=match.index+match[0].length;
 }
 return result+fn(markup.slice(cursor));
}
function patchMarkup(markup,route){
 let changed=markup;
 // Correct real links, while leaving labels, nodes and classes alone.
 changed=changed.replace(/\bhref=(["'])([^"']+)\1/gi,(whole,quote,href)=>{
  if(href==='http://linkedin.com/')return 'href='+quote+'https://www.linkedin.com/'+quote;
  // The calculator exists on the homepage only. Footer links on guide/policy pages
  // used to navigate to a nonexistent same-page fragment.
  if(href==='#calculator' && route!=='')return 'href='+quote+'/#calculator'+quote;
  const absolute=href.startsWith(BASE);
  const path=absolute?href.slice(BASE.length):href;
  const fixed=Object.keys(LINK_MAP).find(p=>path===p||path.startsWith(p+'#')||path.startsWith(p+'?'));
  return fixed?'href='+quote+(absolute?BASE:'')+LINK_MAP[fixed]+path.slice(fixed.length)+quote:whole;
 });
 // Only non-content heading tags in header and footer are demoted.
 // Their Breakdance classes are retained; page H1 remains untouched.
 changed=changed.replace(/<header\b[^>]*>[\s\S]*?<\/header\s*>/gi,part=>part.replace(/<\/?h1\b/gi,m=>m.replace(/h1/i,'h2')));
 changed=changed.replace(/<footer\b[^>]*>[\s\S]*?<\/footer\s*>/gi,part=>part.replace(/<\/?h1\b/gi,m=>m.replace(/h1/i,'h2')));
 changed=changed.replace(/<img\b[^>]*>/gi,tag=>{
  const source=tag.match(/\bsrc=["']([^"']+)["']/i)?.[1]||'';
  // Original branding, served in appropriately sized copies. No layout or CSS changes.
  if(/Logo-in-circle\.png/i.test(source)){
    tag=tag.replace(/(\bsrc=["'][^"']*)Logo-in-circle\.png/i,'$1Logo-in-circle-300x300.png');
    if(!/\bloading\s*=/i.test(tag))tag=tag.replace(/>$/,' loading="lazy">');
  }
  if(/Window-Cleaning-Calculator-small-full-screen-Logo-transaprent/i.test(source)||/UK-TRADE-WEbsites/i.test(source)){
    tag=tag.replace(/\bsizes=["'][^"']+["']/i,'sizes="85px"');
  } else if(/Window-Cleaning-Calculator-Full-Logo-Transaprent-Background/i.test(source)){
    tag=tag.replace(/\bsizes=["'][^"']+["']/i,'sizes="150px"');
  }
  if(/\balt\s*=/i.test(tag))return tag; // deliberate decorative empty alts remain
  if(!source)throw new Error('Image without src or alt: '+tag.slice(0,100));
  return tag.replace(/>$/, ' alt="'+escapeHtml(imageAlt(source))+'">');
 });
 return changed;
}
function buildSchema({path,title,description,route,dates}){
 const orgId=BASE+'/#organization', websiteId=BASE+'/#website',logoId=BASE+'/#logo';
 const graph=[
  {'@type':'ImageObject','@id':logoId,'url':IMAGE,'contentUrl':IMAGE,'width':2000,'height':2000,'caption':BRAND},
  {'@type':'Organization','@id':orgId,'name':BRAND,'url':BASE+'/','logo':{'@id':logoId},
   // Nationwide online calculator: this is NOT a local cleaning contractor.
   'areaServed':{'@type':'Country','name':'United Kingdom'},
   'contactPoint':{'@type':'ContactPoint','contactType':'general enquiries','email':EMAIL}},
  {'@type':'WebSite','@id':websiteId,'url':BASE+'/','name':BRAND,'inLanguage':'en-GB','publisher':{'@id':orgId}}
 ];
 const page={'@type':route==='author/windowcleaningcalculator'?'CollectionPage':'WebPage','@id':path+'#webpage',
  'url':path,'name':title,'description':description,'inLanguage':'en-GB','isPartOf':{'@id':websiteId}};
 if(route===''){
  page.mainEntity={'@id':BASE+'/#calculator'};
  page.primaryImageOfPage={'@id':logoId};
 } else if(route.startsWith('window-cleaning-prices-uk')){
  page.mainEntity={'@id':path+'#article'};
 }
 graph.push(page);
 if(route===''){
  graph.push({'@type':'SoftwareApplication','@id':BASE+'/#calculator','name':BRAND,
   'url':BASE+'/','applicationCategory':'UtilitiesApplication','operatingSystem':'Web',
   'isAccessibleForFree':true,'inLanguage':'en-GB',
   'description':'Free postcode-aware UK window cleaning cost estimates for homeowners and professional window cleaners.',
   'areaServed':{'@type':'Country','name':'United Kingdom'},
   'offers':{'@type':'Offer','price':'0','priceCurrency':'GBP'}});
 }
 if(route.startsWith('window-cleaning-prices-uk')){
  const article={'@type':'Article','@id':path+'#article','headline':title,
   'description':description,'mainEntityOfPage':{'@id':path+'#webpage'},
   'author':{'@id':orgId},'publisher':{'@id':orgId},'inLanguage':'en-GB'};
  if(dates.published)article.datePublished=dates.published;
  if(dates.modified)article.dateModified=dates.modified;
  graph.push(article);
 }
 if(route){
  const crumb=[{'@type':'ListItem','position':1,'name':'Home','item':BASE+'/'}];
  if(route.startsWith('window-cleaning-prices-uk/')&&route!=='window-cleaning-prices-uk'){
   crumb.push({'@type':'ListItem','position':2,'name':'UK window cleaning prices','item':BASE+'/window-cleaning-prices-uk/'});
  }
  crumb.push({'@type':'ListItem','position':crumb.length+1,'name':route==='window-cleaning-prices-uk'?'UK window cleaning prices':title.replace(/\s*\|\s*Window Cleaning Calculator.*$/,'').replace(/\s*\|\s*UK.*$/,''),'item':path});
  graph.push({'@type':'BreadcrumbList','@id':path+'#breadcrumbs','itemListElement':crumb});
 }
 return {'@context':'https://schema.org','@graph':graph};
}
function optimise(html,route){
 const path=BASE+'/'+(route?route+'/':'');
 const originalTitle=tagText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const title=POLICY[route]?.title||originalTitle;
 const description=POLICY[route]?.description||originalValue(html,'name','description');
 if(!title||!description)throw new Error('Missing page title/description for '+route);
 const dates={published:originalValue(html,'property','article:published_time'),modified:originalValue(html,'property','article:modified_time')};
 const htmlHead=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
 if(!htmlHead)throw new Error('Missing head for '+route);
 let head=htmlHead[1];
 head=head.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'<title>'+escapeHtml(title)+'</title>');
 head=head.replace(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script\s*>/gi,'');
 head=head.replace(/<meta\b[^>]*>/gi,tag=>{
  const value=tag.match(/\b(?:name|property)=["']([^"']+)["']/i)?.[1]?.toLowerCase();
  return value&&MANAGED.has(value)?'':tag;
 });
 head=head.replace(/<meta\b[^>]*\bname=["']generator["'][^>]*>/gi,'');
 head=head.replace(/<link\b[^>]*\brel=["'](?:EditURI|shortlink)["'][^>]*>/gi,'');
 head=head.replace(/<link\b[^>]*\brel=["'](?:icon|shortcut icon|apple-touch-icon|manifest)["'][^>]*>/gi,'');
 const tags=[
  meta('description',description),
  meta('robots',route.startsWith('author/')?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1'),
  meta('author',BRAND),
  meta('og:locale','en_GB','property'),
  meta('og:type',route.startsWith('window-cleaning-prices-uk')?'article':'website','property'),
  meta('og:title',title,'property'),
  meta('og:description',description,'property'),
  meta('og:url',path,'property'),
  meta('og:site_name',BRAND,'property'),
  meta('og:image',IMAGE,'property'),
  meta('og:image:secure_url',IMAGE,'property'),
  meta('og:image:alt','Window Cleaning Calculator logo','property'),
  meta('og:image:width','2000','property'),
  meta('og:image:height','2000','property'),
  meta('og:image:type','image/png','property'),
  meta('twitter:card','summary_large_image'),
  meta('twitter:title',title),
  meta('twitter:description',description),
  meta('twitter:image',IMAGE),
  meta('twitter:image:alt','Window Cleaning Calculator logo'),
  '<link rel="icon" type="image/png" sizes="192x192" href="/wcc-icon-192.png">',
  '<link rel="icon" type="image/png" sizes="512x512" href="/wcc-icon-512.png">',
  '<link rel="apple-touch-icon" href="/wcc-apple-touch-icon.png">',
  '<link rel="manifest" href="/wcc-manifest.webmanifest">',
  '<script type="application/ld+json" data-wcc-seo="true">'+JSON.stringify(buildSchema({path,title,description,route,dates})).replace(/</g,'\\u003c')+'</script>'
 ];
 if(route.startsWith('window-cleaning-prices-uk')){
  if(dates.published)tags.push(meta('article:published_time',dates.published,'property'));
  if(dates.modified)tags.push(meta('article:modified_time',dates.modified,'property'));
 }
 if(['privacy-policy','terms-of-use','cookie-policy','cookie-settings'].includes(route)){
  tags.push('<style>.seo-accessible-title{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}</style>');
 }
 if(!/<link\b[^>]*\brel=["']canonical["'][^>]*>/i.test(head))head+='\n<link rel="canonical" href="'+path+'">';
 head+='\n<!-- SEO metadata; original visual design and scripts are preserved -->\n'+tags.join('\n')+'\n';
 let result=html.replace(htmlHead[0],'<head>'+head+'</head>').replace(/<html\b([^>]*)\blang=["'][^"']+["']/i,'<html$1lang="en-GB"');
 const bodyRe=/(<body\b[^>]*>)([\s\S]*?)(<\/body\s*>)/i;
 const bm=result.match(bodyRe);
 if(!bm)throw new Error('Missing body for '+route);
 let content=outsideScripts(bm[2],part=>patchMarkup(part,route));
 if(['privacy-policy','terms-of-use','cookie-policy','cookie-settings'].includes(route)){
  const heading=route==='privacy-policy'?'Privacy Policy':route==='terms-of-use'?'Terms of Use':route==='cookie-policy'?'Cookie Policy':'Cookie Settings';
  const loc=/<\/header\s*>/i;
  if(!loc.test(content))throw new Error('Could not find legal page header for '+route);
  content=content.replace(loc,m=>m+'\n<h1 class="seo-accessible-title">'+heading+'</h1>\n');
 }
 result=result.replace(bodyRe,bm[1]+content+bm[3]);
 return result;
}
const routes=['',...legacyRoutes];
for(const route of routes){
 const file=join('dist',route,'index.html');
 const original=readFileSync(file,'utf8');
 writeFileSync(file,optimise(original,route));
}
console.log('SEO metadata, favicon, structured data, accessible headings, image alts and internal links upgraded on '+routes.length+' pages; original CSS and scripts unchanged.');
