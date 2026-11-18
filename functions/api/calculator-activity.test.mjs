import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequestPost} from './calculator-activity.js';
const token='a'.repeat(64);
const request=(body,origin='https://www.windowcleaningcalculator.co.uk')=>new Request('https://www.windowcleaningcalculator.co.uk/api/calculator-activity',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('forwards only aggregate event fields; never forwards an email',async()=>{
 const previous=globalThis.fetch;try{
  let called;globalThis.fetch=async(url,options)=>{called={url,options};return {ok:true};};
  const r=await onRequestPost({request:request({external_id:'wcc-123456',event_type:'calculation',email:'example@example.com'}),env:{PORTAL_INGEST_TOKEN:token}});
  assert.equal(r.status,200);assert.equal(called.url,'https://portal.prunusmedia.com/api/ingest/calculator-activity');
  assert.deepEqual(JSON.parse(called.options.body),{external_id:'wcc-123456',event_type:'calculation'});
 }finally{globalThis.fetch=previous;}
});
test('rejects invalid origin, invalid kind and missing token',async()=>{
 const good={external_id:'wcc-123456',event_type:'calculation'};
 assert.equal((await onRequestPost({request:request(good,'https://example.com'),env:{PORTAL_INGEST_TOKEN:token}})).status,403);
 assert.equal((await onRequestPost({request:request({...good,event_type:'lead'}),env:{PORTAL_INGEST_TOKEN:token}})).status,400);
 assert.equal((await onRequestPost({request:request(good),env:{}})).status,503);
});
