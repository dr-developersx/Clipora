const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const saved=new Map(),code=fs.readFileSync(require('path').join(__dirname,'../web/demo.js'),'utf8');
function load(){const window={previewCreatorDefaults:{style:'bounce',layout:'blur',channels:{}}};vm.runInNewContext(code,{window,Response,URL,crypto:require('node:crypto').webcrypto,localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},document:{addEventListener(){}}});return window.cliporaDemo;}
const url=p=>new URL('https://example.com/Clipora'+p);
(async()=>{
 let demo=load();
 const response=demo.handle(url('/api/creators'),{method:'POST',body:JSON.stringify({name:'Demo Creator',channel:'https://youtube.com/@rajshamani?si=example'})});
 assert.equal(response.status,200);const row=await response.json();
 assert.equal(row.name,'Demo Creator');assert.ok(row.id);assert.equal(row.profile.name,'@rajshamani');
 demo=load();let sync=await demo.handle(url('/api/sync'),{}).json();assert.equal(sync.creators.length,1);
 let overview=await demo.handle(url('/api/overview'),{}).json();assert.equal(overview.creators[0].earnings,0);
 demo.handle(url('/api/creators/'+row.id),{method:'PUT',body:JSON.stringify({style:'minimal'})});
 demo=load();sync=await demo.handle(url('/api/sync'),{}).json();assert.equal(sync.creators[0].style,'minimal');
 assert.equal(demo.handle(url('/api/jobs'),{method:'POST'}).status,409);
 assert.equal(demo.handle(url('/api/creators'),{method:'POST',body:'{"name":""}'}).status,400);
 demo.handle(url('/api/creators/'+row.id),{method:'DELETE'});
 demo=load();sync=await demo.handle(url('/api/sync'),{}).json();assert.equal(sync.creators.length,0);
 console.log('PASS: demo creator creation, reload, settings, deletion and processing boundary.');
})().catch(e=>{console.error(e);process.exitCode=1;});
