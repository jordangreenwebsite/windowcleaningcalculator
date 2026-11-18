// Same-origin aggregate telemetry relay. Never exposes the per-site portal secret.
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function onRequestPost({request,env}){
  try{
    const origin=request.headers.get('Origin');
    if(!origin||new URL(origin).origin!==new URL(request.url).origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({ok:false},403);
  }catch{return json({ok:false},403);}
  if(!(request.headers.get('content-type')||'').startsWith('application/json'))return json({ok:false},415);
  if(Number(request.headers.get('content-length')||0)>1024)return json({ok:false},413);
  let d;
  try{const raw=await request.text();if(raw.length>1024)return json({ok:false},413);d=JSON.parse(raw);}catch{return json({ok:false},400);}
  if(!d||typeof d.external_id!=='string'||!(/^[a-zA-Z0-9._:-]{8,100}$/).test(d.external_id)||!['calculation','email_result_request','marketing_opt_in','cleaner_feedback'].includes(d.event_type))return json({ok:false},400);
  const token=String(env.PORTAL_INGEST_TOKEN||'').trim();
  if(!/^[a-f0-9]{64}$/.test(token))return json({ok:false},503);
  try{
    const result=await fetch('https://portal.prunusmedia.com/api/ingest/calculator-activity',{method:'POST',
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
      body:JSON.stringify({external_id:d.external_id,event_type:d.event_type}),signal:AbortSignal.timeout(8000)});
    if(!result.ok){console.warn('Calculator portal activity rejected',result.status);return json({ok:false},502);}
    return json({ok:true});
  }catch{console.warn('Calculator portal activity unavailable');return json({ok:false},502);}
}
