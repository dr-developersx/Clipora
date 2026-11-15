/* Used only by the GitHub Pages demo. The installed app always uses its real API. */
(() => {
  const key='clipora.demo.creators.v1';
  let creators=[];
  try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))creators=saved;}catch{}
  let version=0;
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
  const persist=()=>{localStorage.setItem(key,JSON.stringify(creators));version++;};
  const channelInfo=value=>{
    const u=new URL(value.includes('://')?value:'https://'+value);
    const host=u.hostname.toLowerCase().replace(/^www\./,'');
    const platform=host==='youtube.com'||host==='youtu.be'?'youtube':host==='twitch.tv'?'twitch':host==='kick.com'?'kick':'';
    if(!platform||!['https:','http:'].includes(u.protocol))throw Error('Paste a YouTube, Twitch or Kick channel link.');
    return {name:decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||platform),platform,pic:'',channel:u.href,followers:'Demo - no live channel lookup'};
  };
  function setup(){
    let dialog=document.getElementById('demo-setup');
    if(!dialog){
      dialog=document.createElement('dialog');dialog.id='demo-setup';
      dialog.style.cssText='max-width:520px;border:0;border-radius:24px;padding:28px;color:#252525;background:#f7f7f2;font:15px/1.6 system-ui';
      dialog.innerHTML='<form method="dialog"><h2 style="margin-top:0">Run the full Clipora app</h2><p>This GitHub Pages demo can save creator workspaces in this browser and preview caption styles. It cannot process videos, store API keys, record streams or connect posting accounts.</p><p>Run the application on your computer, or deploy the included Docker setup to a server.</p><pre style="white-space:pre-wrap;background:#e7e7df;padding:12px;border-radius:12px">docker compose up -d --build</pre><p><a href="https://github.com/dr-developersx/Clipora#quick-start" target="_blank" rel="noopener">Open setup instructions</a></p><button style="padding:10px 20px;border:0;border-radius:20px;background:#e9ff32;color:#252525">Back to demo</button></form>';
      document.body.append(dialog);
    }
    if(!dialog.open)dialog.showModal();
  }
  window.cliporaDemo={setup,handle(u,options){
    const p=u.pathname.replace(/^\/Clipora/,'');
    const method=(options.method||'GET').toUpperCase();
    const body=()=>JSON.parse(options.body||'{}');
    const rows=()=>creators.map(c=>({...c,live_job:null,log:[]}));
    try{
      if(p==='/api/channel-preview')return reply(channelInfo(u.searchParams.get('url')||''));
      if(p==='/api/sync')return reply({v:'demo.'+version,jobs:[],creators:rows(),accounts:[]});
      if(p==='/api/overview')return reply({creators:creators.map(c=>({id:c.id,name:c.name,state:'idle',autopost:false,clips_today:0,clips_total:0,posted_today:0,posted_total:0,queued:0,failed:0,views:0,earnings:0})),daily:[],posts:[],recording:0,paused:false});
      if(p==='/api/creators'&&method==='GET')return reply(rows());
      if(p==='/api/creators'&&method==='POST'){
        const d=body(),name=String(d.name||'').trim().slice(0,100);
        if(!name)return reply({detail:'Enter a creator name.'},400);
        const profile=d.channel?channelInfo(String(d.channel)):null;
        const row={...window.previewCreatorDefaults,id:crypto.randomUUID(),name,channel:profile?.channel||'',channels:profile?{[profile.platform]:profile.channel}:{},profile,profiles:profile?{[profile.platform]:profile}:{},live_job:null,log:[]};
        creators.push(row);persist();return reply(row);
      }
      const match=/^\/api\/creators\/([\w-]+)$/.exec(p);
      if(match){
        const c=creators.find(c=>c.id===match[1]);if(!c)return reply({detail:'No such demo workspace.'},404);
        if(method==='GET')return reply(c);
        if(method==='DELETE'){creators=creators.filter(c=>c.id!==match[1]);persist();return reply({ok:true});}
        if(method==='PUT'){
          const d=body();
          for(const k of Object.keys(window.previewCreatorDefaults))if(k in d)c[k]=d[k];
          persist();return reply(c);
        }
      }
      if(method!=='GET')return reply({detail:'Full app required: open Run full app for video processing and account connections.'},409);
    }catch(e){return reply({detail:e.message},400);}
    return null;
  }};
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-demo-setup],#goBtn')){e.preventDefault();e.stopImmediatePropagation();setup();}
  },true);
})();
