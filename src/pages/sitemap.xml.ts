import type { APIRoute } from 'astro';
import pages from '../data/pages.json';
export const GET:APIRoute=()=>{
  const base='https://windowcleaningcalculator.co.uk';
  const urls=['/','/window-cleaning-prices-uk/how-often-should-windows-be-cleaned/',...pages.map(page=>'/'+page.slug+'/')];
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(path=>'<url><loc>'+base+path+'</loc></url>').join('')+'</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
