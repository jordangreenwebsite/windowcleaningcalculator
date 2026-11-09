import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
for(const path of ['src/widgets/calculator.html','src/widgets/local-pricing.html']){
 const src=readFileSync(path,'utf8');
 const scripts=[...src.matchAll(/<script(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/script>/gi)];
 if(scripts.length!==1)throw new Error(path+' should contain exactly one standalone script, found '+scripts.length);
 new Script(scripts[0][1],{filename:path});
 console.log(path+' script syntax OK');
}
const app=readFileSync('src/widgets/calculator.html','utf8');
for(const field of ['save_calculation','cleaner_feedback','email_result','postcodes.io','appsScriptUrl']){
 if(!app.includes(field))throw new Error('Missing calculator integration '+field);
}
