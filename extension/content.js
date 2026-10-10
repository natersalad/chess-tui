(()=>{
 const channel=crypto.randomUUID(),pending=new Map();
 window.addEventListener('message',e=>{if(e.source!==window||e.origin!==location.origin||e.data?.source!=='terminal-chess-page'||e.data.channel!==channel)return;const m=e.data;
  if(m.type==='snapshot')chrome.runtime.sendMessage({type:'snapshot',state:m.state}).catch(()=>{});
  if(m.type==='ack'){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);p.reply({ok:m.ok===true,error:m.error});}}
 });
 chrome.runtime.onMessage.addListener((m,_sender,reply)=>{if(m.type!=='command')return;const c=m.command;if(typeof c.id!=='string'||pending.has(c.id))return;
  const timer=setTimeout(()=>{pending.delete(c.id);reply({ok:false,error:'Website response uncertain; check browser before retry.'});},5500);pending.set(c.id,{reply,timer});window.postMessage({source:'terminal-chess-content',channel,type:'command',command:c},location.origin);return true;
 });
 window.postMessage({source:'terminal-chess-content',channel,type:'init'},location.origin);
})();
