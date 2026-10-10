// Runs only a fixed, validated protocol; no remote scripts or arbitrary evaluation.
let ws,token='',boundTab=null,connecting=false,pending=null;
const tabs=new Map();
function send(m){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify(m));}
function selected(){const now=Date.now();const live=[...tabs.entries()].filter(([,s])=>now-s.seen<5000);if(boundTab!==null)return live.find(([id])=>id===boundTab);if(live.length===1)return live[0];return null;}
function publish(){const target=selected();if(target)send({type:'snapshot',state:target[1].state});else send({type:'notice',text:tabs.size>1?'Multiple Chess.com tabs: click extension icon on the intended tab.':'Open a logged-in Chess.com /play/online tab.'});}
async function connect(){if(connecting||ws?.readyState===WebSocket.OPEN)return;const c=await chrome.storage.local.get(['token','boundTab']);token=c.token||'';boundTab=c.boundTab??null;if(!/^[a-f0-9]{64}$/.test(token))return;connecting=true;
 try{ws=new WebSocket('ws://127.0.0.1:17391');ws.onopen=()=>{connecting=false;send({type:'hello',token});};ws.onerror=()=>{connecting=false;};ws.onclose=()=>{connecting=false;};
  ws.onmessage=async e=>{let m;try{m=JSON.parse(e.data);}catch{return;}if(m.type==='hello'){publish();return;}
   if(!['move','prepare-game','create-game','cancel-search','resign','draw'].includes(m.type)||typeof m.id!=='string')return;
   if(pending){send({type:'ack',id:m.id,ok:false,error:'Browser action already pending'});return;}
   const target=selected();if(!target){send({type:'ack',id:m.id,ok:false,error:'Bind exactly one Chess.com tab via the extension icon.'});return;}
   pending=m.id;try{const r=await chrome.tabs.sendMessage(target[0],{type:'command',command:m});send({type:'ack',id:m.id,ok:r?.ok===true,error:r?.error});}catch{send({type:'ack',id:m.id,ok:false,error:'Browser tab unavailable; action not confirmed'});}finally{pending=null;}
  };
 }catch{connecting=false;}}
chrome.runtime.onMessage.addListener((m,sender,reply)=>{if(m.type==='snapshot'&&sender.tab&&sender.url?.startsWith('https://www.chess.com/')){tabs.set(sender.tab.id,{state:m.state,seen:Date.now()});publish();}if(m.type==='options-status'){reply({connected:ws?.readyState===WebSocket.OPEN,boundTab});}if(m.type==='reconnect'){ws?.close();connecting=false;void connect();reply({ok:true});}});
chrome.action.onClicked.addListener(async tab=>{if(tab.url?.startsWith('https://www.chess.com/')){boundTab=tab.id;await chrome.storage.local.set({boundTab});publish();}else await chrome.runtime.openOptionsPage();});
chrome.storage.onChanged.addListener(()=>{ws?.close();connecting=false;void connect();});
setInterval(()=>{void connect();publish();},2000);void connect();
